import { eq } from "drizzle-orm";
import { requireDb } from "@/src/db";
import { studyPrograms } from "@/src/db/schema";
import { curricula } from "@/src/db/schema-phase5";
import type { SessionUser } from "@/src/lib/auth";
import { scopeAllows } from "@/src/lib/rbac";

export async function getProgramContext(studyProgramId:number){
  const db=requireDb();
  const [program]=await db.select().from(studyPrograms).where(eq(studyPrograms.id,studyProgramId)).limit(1);
  return program??null;
}

export async function canAccessProgram(user:SessionUser,studyProgramId:number){
  const program=await getProgramContext(studyProgramId);
  return !!program&&program.status==="ACTIVE"&&scopeAllows(user,program.organizationId,studyProgramId);
}

export async function getCurriculumContext(curriculumId:number){
  const db=requireDb();
  const [curriculum]=await db.select().from(curricula).where(eq(curricula.id,curriculumId)).limit(1);
  if(!curriculum)return null;
  const program=await getProgramContext(curriculum.studyProgramId);
  if(!program)return null;
  return {curriculum,program};
}

export async function canAccessCurriculum(user:SessionUser,curriculumId:number){
  const context=await getCurriculumContext(curriculumId);
  return !!context&&scopeAllows(user,context.program.organizationId,context.program.id);
}
