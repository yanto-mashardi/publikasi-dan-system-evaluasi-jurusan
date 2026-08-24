import {and,eq} from "drizzle-orm";
import {NextResponse} from "next/server";
import {z} from "zod";
import {requireDb} from "@/src/db";
import {accreditationCriteria,accreditationFrameworks,accreditationIndicatorMandates,accreditationIndicators,studyProgramAccreditationFrameworks} from "@/src/db/schema-accreditation";
import {organizations,studyPrograms} from "@/src/db/schema";
import {accreditationIndicatorModuleSources} from "@/src/db/schema-evaluation-modules";
import {audit} from "@/src/lib/audit";
import {getSession} from "@/src/lib/auth";
import {hasRole,scopeAllows} from "@/src/lib/rbac";

const input=z.object({frameworkId:z.number().int().positive(),indicatorId:z.number().int().positive(),period:z.string().regex(/^\d{4}\/\d{4}-(GANJIL|GENAP)$/),responsibilityScope:z.enum(["UPPS","PRODI"])});
const bulkInput=z.object({items:z.array(input.omit({responsibilityScope:true})).min(1).max(500),responsibilityScope:z.enum(["UPPS","PRODI"])});
function canManage(session:NonNullable<Awaited<ReturnType<typeof getSession>>>){return hasRole(session,"ADMIN_DATA")||hasRole(session,"ADMIN_SYSTEM");}

async function applyMandate(session:NonNullable<Awaited<ReturnType<typeof getSession>>>,data:z.infer<typeof input>){
 const db=requireDb();
 const[indicator]=await db.select({frameworkId:accreditationIndicators.frameworkId}).from(accreditationIndicators).where(and(eq(accreditationIndicators.id,data.indicatorId),eq(accreditationIndicators.status,"ACTIVE"))).limit(1);if(!indicator||indicator.frameworkId!==data.frameworkId)throw new Error("Indikator tidak termasuk instrumen tersebut.");
 const assignments=await db.select({assignmentId:studyProgramAccreditationFrameworks.id,organizationId:studyPrograms.organizationId}).from(studyProgramAccreditationFrameworks).innerJoin(studyPrograms,eq(studyProgramAccreditationFrameworks.studyProgramId,studyPrograms.id)).where(and(eq(studyProgramAccreditationFrameworks.frameworkId,data.frameworkId),eq(studyProgramAccreditationFrameworks.assignmentStatus,"ACTIVE")));const allowed=assignments.filter(row=>scopeAllows(session,row.organizationId,null));if(!allowed.length)throw new Error("Tidak ada Prodi dalam scope Jurusan Anda yang menggunakan instrumen ini.");
 const responsibleRole=data.responsibilityScope==="PRODI"?"KAPRODI":"ADMIN_DATA";
 for(const assignment of allowed)await db.insert(accreditationIndicatorMandates).values({assignmentId:assignment.assignmentId,indicatorId:data.indicatorId,period:data.period,responsibilityScope:data.responsibilityScope,responsibleRole,validatorRole:"KAJUR",assignedBy:session.userId,status:"ACTIVE"}).onDuplicateKeyUpdate({set:{responsibilityScope:data.responsibilityScope,responsibleRole,validatorRole:"KAJUR",assignedBy:session.userId,status:"ACTIVE",updatedAt:new Date()}});
 return {frameworkId:data.frameworkId,indicatorId:data.indicatorId,appliedToPrograms:allowed.length,responsibilityScope:data.responsibilityScope,responsibleRole,validatorRole:"KAJUR"};
}

export async function GET(req:Request){
  const session=await getSession();if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});if(!canManage(session))return NextResponse.json({error:"Hanya Admin Jurusan yang dapat membagi mandat indikator."},{status:403});
  const selectedPeriod=new URL(req.url).searchParams.get("period")??"";if(!/^\d{4}\/\d{4}-(GANJIL|GENAP)$/.test(selectedPeriod))return NextResponse.json([]);const db=requireDb();
  const rows=await db.select({assignmentId:studyProgramAccreditationFrameworks.id,organizationId:organizations.id,organizationName:organizations.name,studyProgramId:studyPrograms.id,studyProgramCode:studyPrograms.code,studyProgramName:studyPrograms.name,frameworkId:accreditationFrameworks.id,frameworkCode:accreditationFrameworks.code,frameworkName:accreditationFrameworks.name,indicatorId:accreditationIndicators.id,indicatorCode:accreditationIndicators.code,indicatorName:accreditationIndicators.name,criterionCode:accreditationCriteria.code,criterionName:accreditationCriteria.name,responsibilityScope:accreditationIndicatorMandates.responsibilityScope,responsibleRole:accreditationIndicatorMandates.responsibleRole,validatorRole:accreditationIndicatorMandates.validatorRole,mandateStatus:accreditationIndicatorMandates.status}).from(studyProgramAccreditationFrameworks).innerJoin(studyPrograms,eq(studyProgramAccreditationFrameworks.studyProgramId,studyPrograms.id)).innerJoin(organizations,eq(studyPrograms.organizationId,organizations.id)).innerJoin(accreditationFrameworks,eq(studyProgramAccreditationFrameworks.frameworkId,accreditationFrameworks.id)).innerJoin(accreditationIndicators,and(eq(accreditationIndicators.frameworkId,accreditationFrameworks.id),eq(accreditationIndicators.status,"ACTIVE"))).innerJoin(accreditationCriteria,eq(accreditationIndicators.criterionId,accreditationCriteria.id)).leftJoin(accreditationIndicatorMandates,and(eq(accreditationIndicatorMandates.assignmentId,studyProgramAccreditationFrameworks.id),eq(accreditationIndicatorMandates.indicatorId,accreditationIndicators.id),eq(accreditationIndicatorMandates.period,selectedPeriod))).where(eq(studyProgramAccreditationFrameworks.assignmentStatus,"ACTIVE"));
  const moduleSources=await db.select().from(accreditationIndicatorModuleSources).where(eq(accreditationIndicatorModuleSources.status,"ACTIVE"));
  const visible=rows.filter(row=>scopeAllows(session,row.organizationId,null)),grouped=new Map<string,Record<string,any>>();
  for(const row of visible){const key=`${row.frameworkId}:${row.indicatorId}`,found=grouped.get(key);if(found){found.assignmentIds.push(row.assignmentId);found.programCount+=1;if(found.responsibilityScope!==row.responsibilityScope){found.responsibilityScope=null;found.responsibleRole=null;}}else grouped.set(key,{...row,studyProgramId:null,studyProgramCode:null,studyProgramName:null,assignmentIds:[row.assignmentId],programCount:1});}
  return NextResponse.json([...grouped.values()].map(row=>({...row,moduleSourceIds:moduleSources.filter(source=>source.frameworkId===row.frameworkId&&source.indicatorId===row.indicatorId).map(source=>source.moduleId)})));
}

export async function POST(req:Request){
  const session=await getSession();if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});if(!canManage(session))return NextResponse.json({error:"Hanya Admin Jurusan yang dapat membagi mandat indikator."},{status:403});
  const parsed=input.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
  try{const result=await applyMandate(session,parsed.data);await audit({actorId:session.userId,action:"ASSIGN_ACCREDITATION_INDICATOR_MANDATE",subjectType:"ACCREDITATION_INDICATOR",subjectId:parsed.data.indicatorId,after:result});return NextResponse.json(result);}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Mandat gagal disimpan."},{status:409});}
}

export async function PUT(req:Request){
 const session=await getSession();if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});if(!canManage(session))return NextResponse.json({error:"Hanya Admin Jurusan yang dapat membagi mandat indikator."},{status:403});
 const parsed=bulkInput.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
 try{const results=[];for(const item of parsed.data.items)results.push(await applyMandate(session,{...item,responsibilityScope:parsed.data.responsibilityScope}));await audit({actorId:session.userId,action:"BULK_ASSIGN_ACCREDITATION_INDICATOR_MANDATE",subjectType:"ACCREDITATION_INDICATOR",subjectId:parsed.data.items[0].indicatorId,after:{responsibilityScope:parsed.data.responsibilityScope,items:parsed.data.items,count:results.length}});return NextResponse.json({updated:results.length,appliedToPrograms:Math.max(...results.map(row=>row.appliedToPrograms))});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Mandat massal gagal disimpan."},{status:409});}
}
