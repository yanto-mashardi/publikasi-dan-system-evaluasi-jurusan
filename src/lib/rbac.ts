import type { SessionUser } from "./auth";
export const ROLE_PERMISSIONS:Record<string,string[]>={
 ADMIN_SYSTEM:["system.configure","users.manage","roles.manage","master.manage","audit.read"],
 ADMIN_DATA:["data.create","data.update","evidence.upload","publication.execute"],
 KAPRODI:["program.read","program.update","curriculum.manage","kpi.measure","evidence.upload","followup.execute"],
 GKM:["quality.read","evidence.verify","evaluation.create","finding.create","recommendation.create","followup.verify","publication.recommend"],
 SEKJUR:["data.verify","workflow.coordinate","publication.review","followup.verify"],
 KAJUR:["approval.final","evaluation.approve","publication.approve","report.approve"],
 VIEWER_INTERNAL:["internal.read"]};
export function can(user:SessionUser|null,permission:string){return !!user&&(ROLE_PERMISSIONS[user.role]?.includes(permission)??false);}
export function scopeAllows(user:SessionUser,organizationId:number,studyProgramId?:number|null){if(user.role==="KAPRODI")return user.organizationId===organizationId&&(!studyProgramId||user.studyProgramId===studyProgramId);return user.organizationId===organizationId;}
