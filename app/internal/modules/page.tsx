import {eq} from "drizzle-orm";
import {redirect} from "next/navigation";
import {requireDb} from "@/src/db";
import {studyProgramAccreditationFrameworks} from "@/src/db/schema-accreditation";
import {organizations,studyPrograms} from "@/src/db/schema";
import {getSession} from "@/src/lib/auth";
import {can,scopeAllows} from "@/src/lib/rbac";
import ModuleWorkspace from "./ModuleWorkspace";
import "./modules.css";
export const dynamic="force-dynamic";
export default async function Page(){const session=await getSession();if(!session)redirect("/internal/login");if(!can(session,"accreditation.read"))redirect("/internal");const db=requireDb(),rows=await db.select({assignmentId:studyProgramAccreditationFrameworks.id,organizationId:organizations.id,organizationName:organizations.name,studyProgramId:studyPrograms.id,programCode:studyPrograms.code,programName:studyPrograms.name}).from(studyProgramAccreditationFrameworks).innerJoin(studyPrograms,eq(studyPrograms.id,studyProgramAccreditationFrameworks.studyProgramId)).innerJoin(organizations,eq(organizations.id,studyPrograms.organizationId)).where(eq(studyProgramAccreditationFrameworks.assignmentStatus,"ACTIVE"));return <ModuleWorkspace assignments={rows.filter(row=>scopeAllows(session,row.organizationId,row.studyProgramId))}/>;}
