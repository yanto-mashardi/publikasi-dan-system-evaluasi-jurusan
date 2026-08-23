import { and,eq } from "drizzle-orm";
import { requireDb } from "@/src/db";
import { studyPrograms } from "@/src/db/schema";
import { governanceScopes } from "@/src/db/schema-phase5";
import type { SessionUser } from "@/src/lib/auth";
import { scopeAllows } from "@/src/lib/rbac";

export async function validateGovernanceScope(organizationId:number,studyProgramId?:number|null){
  if(studyProgramId==null)return true;
  const db=requireDb();
  const [program]=await db.select({id:studyPrograms.id}).from(studyPrograms).where(and(eq(studyPrograms.id,studyProgramId),eq(studyPrograms.organizationId,organizationId),eq(studyPrograms.status,"ACTIVE"))).limit(1);
  return !!program;
}

export async function attachGovernanceScope(input:{subjectType:string;subjectId:number;organizationId:number;studyProgramId?:number|null}){
  const db=requireDb();
  await db.insert(governanceScopes).values({subjectType:input.subjectType,subjectId:input.subjectId,organizationId:input.organizationId,studyProgramId:input.studyProgramId??null});
}

export async function getGovernanceScope(subjectType:string,subjectId:number){
  const db=requireDb();
  const [scope]=await db.select().from(governanceScopes).where(and(eq(governanceScopes.subjectType,subjectType),eq(governanceScopes.subjectId,subjectId))).limit(1);
  return scope??null;
}

export async function assertSubjectScope(user:SessionUser,subjectType:string,subjectId:number,fallbackOrganizationId?:number){
  const scope=await getGovernanceScope(subjectType,subjectId);
  const organizationId=scope?.organizationId??fallbackOrganizationId;
  if(!organizationId)return false;
  return scopeAllows(user,organizationId,scope?.studyProgramId??null);
}
