import {and,eq,inArray} from "drizzle-orm";
import {requireDb} from "@/src/db";
import {accreditationIndicatorMandates,studyProgramAccreditationFrameworks} from "@/src/db/schema-accreditation";
import {accreditationIndicatorModuleSources,evaluationModules,evaluationPeriods} from "@/src/db/schema-evaluation-modules";
import {studyPrograms} from "@/src/db/schema";
import type {SessionUser} from "@/src/lib/auth";
import {hasRole,scopeAllows} from "@/src/lib/rbac";

export async function moduleMandateAccess(session:SessionUser,moduleCode:string,studyProgramId:number,period:string){
 if(hasRole(session,"ADMIN_SYSTEM"))return {canInput:true,assignedIndicators:0};
 if(!studyProgramId||!period)return {canInput:false,assignedIndicators:0};
 const db=requireDb(),[program]=await db.select({organizationId:studyPrograms.organizationId}).from(studyPrograms).where(eq(studyPrograms.id,studyProgramId)).limit(1);if(!program||!scopeAllows(session,program.organizationId,studyProgramId))return {canInput:false,assignedIndicators:0};
 const[registeredPeriod]=await db.select({id:evaluationPeriods.id,status:evaluationPeriods.status}).from(evaluationPeriods).where(and(eq(evaluationPeriods.organizationId,program.organizationId),eq(evaluationPeriods.label,period))).limit(1);if(!registeredPeriod||registeredPeriod.status!=="OPEN")return {canInput:false,assignedIndicators:0};
 const[assignment]=await db.select({id:studyProgramAccreditationFrameworks.id,frameworkId:studyProgramAccreditationFrameworks.frameworkId}).from(studyProgramAccreditationFrameworks).where(and(eq(studyProgramAccreditationFrameworks.studyProgramId,studyProgramId),eq(studyProgramAccreditationFrameworks.assignmentStatus,"ACTIVE"))).limit(1);if(!assignment)return {canInput:false,assignedIndicators:0};
 const[module]=await db.select({id:evaluationModules.id}).from(evaluationModules).where(and(eq(evaluationModules.code,moduleCode),eq(evaluationModules.status,"ACTIVE"))).limit(1);if(!module)return {canInput:false,assignedIndicators:0};
 const sources=await db.select({indicatorId:accreditationIndicatorModuleSources.indicatorId}).from(accreditationIndicatorModuleSources).where(and(eq(accreditationIndicatorModuleSources.frameworkId,assignment.frameworkId),eq(accreditationIndicatorModuleSources.moduleId,module.id),eq(accreditationIndicatorModuleSources.status,"ACTIVE")));if(!sources.length)return {canInput:false,assignedIndicators:0};
 const mandates=await db.select().from(accreditationIndicatorMandates).where(and(eq(accreditationIndicatorMandates.assignmentId,assignment.id),eq(accreditationIndicatorMandates.period,period),eq(accreditationIndicatorMandates.status,"ACTIVE"),inArray(accreditationIndicatorMandates.indicatorId,sources.map(row=>row.indicatorId))));
 const canInput=mandates.some(row=>row.responsibleRole==="ADMIN_DATA"&&hasRole(session,"ADMIN_DATA")||row.responsibleRole==="KAPRODI"&&hasRole(session,"KAPRODI"));return {canInput,assignedIndicators:mandates.length};
}
