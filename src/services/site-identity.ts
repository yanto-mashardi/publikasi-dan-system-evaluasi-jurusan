import { and, asc, eq } from "drizzle-orm";
import { requireDb } from "@/src/db";
import { organizations, studyPrograms } from "@/src/db/schema";

export async function getSiteIdentity() {
  const db = requireDb();
  const [organization] = await db.select({
    id: organizations.id,
    code: organizations.code,
    name: organizations.name,
    type: organizations.type,
  }).from(organizations).where(eq(organizations.status, "ACTIVE")).orderBy(asc(organizations.id)).limit(1);

  const programs = organization
    ? await db.select({ id: studyPrograms.id, code: studyPrograms.code, name: studyPrograms.name, level: studyPrograms.level })
      .from(studyPrograms)
      .where(and(eq(studyPrograms.organizationId, organization.id), eq(studyPrograms.status, "ACTIVE")))
      .orderBy(asc(studyPrograms.name))
    : [];

  return { organization: organization ?? null, programs, displayName: organization?.name ?? "Portal Jurusan" };
}
