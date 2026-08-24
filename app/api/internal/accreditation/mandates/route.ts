import {and,eq} from "drizzle-orm";
import {NextResponse} from "next/server";
import {z} from "zod";
import {requireDb} from "@/src/db";
import {accreditationCriteria,accreditationFrameworks,accreditationIndicatorMandates,accreditationIndicators,studyProgramAccreditationFrameworks} from "@/src/db/schema-accreditation";
import {organizations,studyPrograms} from "@/src/db/schema";
import {audit} from "@/src/lib/audit";
import {getSession} from "@/src/lib/auth";
import {hasRole,scopeAllows} from "@/src/lib/rbac";

const input=z.object({assignmentId:z.number().int().positive(),indicatorId:z.number().int().positive(),responsibilityScope:z.enum(["UPPS","PRODI"])});
function canManage(session:NonNullable<Awaited<ReturnType<typeof getSession>>>){return hasRole(session,"ADMIN_DATA")||hasRole(session,"ADMIN_SYSTEM");}

export async function GET(){
  const session=await getSession();if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});if(!canManage(session))return NextResponse.json({error:"Hanya Admin Jurusan yang dapat membagi mandat indikator."},{status:403});
  const db=requireDb();
  const rows=await db.select({assignmentId:studyProgramAccreditationFrameworks.id,organizationId:organizations.id,organizationName:organizations.name,studyProgramId:studyPrograms.id,studyProgramCode:studyPrograms.code,studyProgramName:studyPrograms.name,frameworkId:accreditationFrameworks.id,frameworkCode:accreditationFrameworks.code,frameworkName:accreditationFrameworks.name,indicatorId:accreditationIndicators.id,indicatorCode:accreditationIndicators.code,indicatorName:accreditationIndicators.name,criterionCode:accreditationCriteria.code,criterionName:accreditationCriteria.name,responsibilityScope:accreditationIndicatorMandates.responsibilityScope,responsibleRole:accreditationIndicatorMandates.responsibleRole,validatorRole:accreditationIndicatorMandates.validatorRole,mandateStatus:accreditationIndicatorMandates.status}).from(studyProgramAccreditationFrameworks).innerJoin(studyPrograms,eq(studyProgramAccreditationFrameworks.studyProgramId,studyPrograms.id)).innerJoin(organizations,eq(studyPrograms.organizationId,organizations.id)).innerJoin(accreditationFrameworks,eq(studyProgramAccreditationFrameworks.frameworkId,accreditationFrameworks.id)).innerJoin(accreditationIndicators,and(eq(accreditationIndicators.frameworkId,accreditationFrameworks.id),eq(accreditationIndicators.status,"ACTIVE"))).innerJoin(accreditationCriteria,eq(accreditationIndicators.criterionId,accreditationCriteria.id)).leftJoin(accreditationIndicatorMandates,and(eq(accreditationIndicatorMandates.assignmentId,studyProgramAccreditationFrameworks.id),eq(accreditationIndicatorMandates.indicatorId,accreditationIndicators.id))).where(eq(studyProgramAccreditationFrameworks.assignmentStatus,"ACTIVE"));
  return NextResponse.json(rows.filter(row=>scopeAllows(session,row.organizationId,null)));
}

export async function POST(req:Request){
  const session=await getSession();if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});if(!canManage(session))return NextResponse.json({error:"Hanya Admin Jurusan yang dapat membagi mandat indikator."},{status:403});
  const parsed=input.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});const data=parsed.data,db=requireDb();
  const[context]=await db.select({organizationId:studyPrograms.organizationId,frameworkId:studyProgramAccreditationFrameworks.frameworkId,indicatorFrameworkId:accreditationIndicators.frameworkId}).from(studyProgramAccreditationFrameworks).innerJoin(studyPrograms,eq(studyProgramAccreditationFrameworks.studyProgramId,studyPrograms.id)).innerJoin(accreditationIndicators,eq(accreditationIndicators.id,data.indicatorId)).where(and(eq(studyProgramAccreditationFrameworks.id,data.assignmentId),eq(studyProgramAccreditationFrameworks.assignmentStatus,"ACTIVE"))).limit(1);
  if(!context||context.frameworkId!==context.indicatorFrameworkId)return NextResponse.json({error:"Indikator tidak termasuk instrumen Prodi tersebut."},{status:409});if(!scopeAllows(session,context.organizationId,null))return NextResponse.json({error:"Di luar scope Jurusan Anda."},{status:403});
  const responsibleRole=data.responsibilityScope==="PRODI"?"KAPRODI":"ADMIN_DATA";
  await db.insert(accreditationIndicatorMandates).values({...data,responsibleRole,validatorRole:"KAJUR",assignedBy:session.userId,status:"ACTIVE"}).onDuplicateKeyUpdate({set:{responsibilityScope:data.responsibilityScope,responsibleRole,validatorRole:"KAJUR",assignedBy:session.userId,status:"ACTIVE",updatedAt:new Date()}});
  await audit({actorId:session.userId,action:"ASSIGN_ACCREDITATION_INDICATOR_MANDATE",subjectType:"ACCREDITATION_INDICATOR",subjectId:data.indicatorId,after:{assignmentId:data.assignmentId,responsibilityScope:data.responsibilityScope,responsibleRole,validatorRole:"KAJUR"}});
  return NextResponse.json({assignmentId:data.assignmentId,indicatorId:data.indicatorId,responsibilityScope:data.responsibilityScope,responsibleRole,validatorRole:"KAJUR"});
}
