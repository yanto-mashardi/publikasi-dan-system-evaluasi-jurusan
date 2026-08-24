import {and,eq,inArray} from "drizzle-orm";
import {NextResponse} from "next/server";
import {z} from "zod";
import {requireDb} from "@/src/db";
import {studyPrograms} from "@/src/db/schema";
import {accreditationCriteria,accreditationIndicatorMandates,accreditationIndicators,studyProgramAccreditationFrameworks} from "@/src/db/schema-accreditation";
import {accreditationIndicatorModuleSources,evaluationModules,evaluationPeriods} from "@/src/db/schema-evaluation-modules";
import {audit} from "@/src/lib/audit";
import {getSession} from "@/src/lib/auth";
import {hasRole,scopeAllows} from "@/src/lib/rbac";

const input=z.object({organizationId:z.number().int().positive(),period:z.string().regex(/^\d{4}\/\d{4}-(GANJIL|GENAP)$/)});
const rules:[RegExp,string,"PRODI"|"UPPS"][]=[
 [/visi|misi|vmts|profil lulusan/i,"VMTS_PROFILE","PRODI"],
 [/kurikulum|pembelajaran|cpl|cpmk|mata kuliah|akademik/i,"LEARNING","PRODI"],
 [/mahasiswa|lulusan|kelulusan|tracer|alumni/i,"STUDENTS_GRADUATES","PRODI"],
 [/dosen|tenaga kependidikan|sumber daya manusia|sdm/i,"HUMAN_RESOURCES","UPPS"],
 [/laboratorium|sarana|prasarana|k3l|keselamatan|peralatan/i,"FACILITIES_K3L","UPPS"],
 [/penelitian|pengabdian|pkm|publikasi ilmiah/i,"RESEARCH_PKM","UPPS"],
 [/kerja sama|kerjasama|mitra/i,"COOPERATION","UPPS"],
];
function suggestion(text:string){return rules.find(([pattern])=>pattern.test(text))?.slice(1) as [string,"PRODI"|"UPPS"]|undefined??["GOVERNANCE_QUALITY","UPPS"] as const;}

export async function POST(req:Request){
 const session=await getSession();if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});if(!hasRole(session,"ADMIN_DATA")&&!hasRole(session,"ADMIN_SYSTEM"))return NextResponse.json({error:"Hanya Admin Jurusan yang dapat menyiapkan konfigurasi awal."},{status:403});const parsed=input.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});const{organizationId,period}=parsed.data;if(!scopeAllows(session,organizationId,null))return NextResponse.json({error:"Scope Jurusan tidak sesuai."},{status:403});
 const db=requireDb(),[periodRow]=await db.select().from(evaluationPeriods).where(and(eq(evaluationPeriods.organizationId,organizationId),eq(evaluationPeriods.label,period))).limit(1);if(!periodRow)return NextResponse.json({error:"Buat periode terlebih dahulu."},{status:409});if(periodRow.status!=="OPEN")return NextResponse.json({error:"Periode sudah ditutup."},{status:409});
 const programs=await db.select({id:studyPrograms.id}).from(studyPrograms).where(and(eq(studyPrograms.organizationId,organizationId),eq(studyPrograms.status,"ACTIVE"))),programIds=programs.map(row=>row.id),assignments=programIds.length?await db.select({id:studyProgramAccreditationFrameworks.id,frameworkId:studyProgramAccreditationFrameworks.frameworkId}).from(studyProgramAccreditationFrameworks).where(and(inArray(studyProgramAccreditationFrameworks.studyProgramId,programIds),eq(studyProgramAccreditationFrameworks.assignmentStatus,"ACTIVE"))):[];if(!assignments.length)return NextResponse.json({error:"Belum ada Prodi dengan instrumen aktif."},{status:409});
 const frameworkIds=[...new Set(assignments.map(row=>row.frameworkId))],indicators=await db.select({id:accreditationIndicators.id,frameworkId:accreditationIndicators.frameworkId,code:accreditationIndicators.code,name:accreditationIndicators.name,description:accreditationIndicators.description,criterionName:accreditationCriteria.name}).from(accreditationIndicators).innerJoin(accreditationCriteria,eq(accreditationCriteria.id,accreditationIndicators.criterionId)).where(and(inArray(accreditationIndicators.frameworkId,frameworkIds),eq(accreditationIndicators.status,"ACTIVE"))),modules=await db.select().from(evaluationModules).where(eq(evaluationModules.status,"ACTIVE")),moduleByCode=new Map(modules.map(row=>[row.code,row]));
 let mappingsCreated=0,mandatesCreated=0,unchanged=0;
 for(const indicator of indicators){const[moduleCode,scope]=suggestion(`${indicator.code} ${indicator.name} ${indicator.description??""} ${indicator.criterionName}`),module=moduleByCode.get(moduleCode);if(!module)continue;const[existingMap]=await db.select({id:accreditationIndicatorModuleSources.id}).from(accreditationIndicatorModuleSources).where(and(eq(accreditationIndicatorModuleSources.frameworkId,indicator.frameworkId),eq(accreditationIndicatorModuleSources.indicatorId,indicator.id),eq(accreditationIndicatorModuleSources.status,"ACTIVE"))).limit(1);if(!existingMap){await db.insert(accreditationIndicatorModuleSources).values({frameworkId:indicator.frameworkId,indicatorId:indicator.id,moduleId:module.id,assignedBy:session.userId,status:"ACTIVE"});mappingsCreated++;}
  for(const assignment of assignments.filter(row=>row.frameworkId===indicator.frameworkId)){const[existingMandate]=await db.select({id:accreditationIndicatorMandates.id}).from(accreditationIndicatorMandates).where(and(eq(accreditationIndicatorMandates.assignmentId,assignment.id),eq(accreditationIndicatorMandates.indicatorId,indicator.id),eq(accreditationIndicatorMandates.period,period))).limit(1);if(existingMandate){unchanged++;continue;}await db.insert(accreditationIndicatorMandates).values({assignmentId:assignment.id,indicatorId:indicator.id,period,responsibilityScope:scope,responsibleRole:scope==="PRODI"?"KAPRODI":"ADMIN_DATA",validatorRole:"KAJUR",assignedBy:session.userId,status:"ACTIVE"});mandatesCreated++;}
 }
 const result={mappingsCreated,mandatesCreated,unchanged,indicators:indicators.length};await audit({actorId:session.userId,action:"APPLY_DEFAULT_EVALUATION_SETUP",subjectType:"EVALUATION_PERIOD",subjectId:periodRow.id,after:result});return NextResponse.json(result);
}
