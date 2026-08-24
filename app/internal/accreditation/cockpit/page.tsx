import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { requireDb } from "@/src/db";
import { accreditationAgencies, accreditationFrameworks, studyProgramAccreditationFrameworks } from "@/src/db/schema-accreditation";
import { organizations, studyPrograms } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { can, scopeAllows } from "@/src/lib/rbac";
import AccreditationCockpit from "./AccreditationCockpit";
import "./cockpit.css";
import "./workflow.css";

export const dynamic="force-dynamic";
export default async function CockpitPage(){const session=await getSession();if(!session)redirect("/internal/login");if(!can(session,"accreditation.read"))redirect("/internal/admin");const db=requireDb();const rows=await db.select({assignmentId:studyProgramAccreditationFrameworks.id,studyProgramId:studyPrograms.id,programCode:studyPrograms.code,programName:studyPrograms.name,organizationId:organizations.id,organizationCode:organizations.code,organizationName:organizations.name,frameworkId:accreditationFrameworks.id,frameworkCode:accreditationFrameworks.code,frameworkName:accreditationFrameworks.name,frameworkYear:accreditationFrameworks.instrumentYear,agencyCode:accreditationAgencies.code,agencyName:accreditationAgencies.name,isPrimary:studyProgramAccreditationFrameworks.isPrimary}).from(studyProgramAccreditationFrameworks).innerJoin(studyPrograms,eq(studyProgramAccreditationFrameworks.studyProgramId,studyPrograms.id)).innerJoin(organizations,eq(studyPrograms.organizationId,organizations.id)).innerJoin(accreditationFrameworks,eq(studyProgramAccreditationFrameworks.frameworkId,accreditationFrameworks.id)).innerJoin(accreditationAgencies,eq(accreditationFrameworks.agencyId,accreditationAgencies.id)).where(eq(studyProgramAccreditationFrameworks.assignmentStatus,"ACTIVE"));const assignments=rows.filter(row=>scopeAllows(session,row.organizationId,row.studyProgramId));return <main className="cockpit-shell"><header className="cockpit-top"><div><span>Accreditation Cockpit</span><h1>Evaluasi kesiapan internal</h1><p>Framework → Prodi → periode → IPO → kriteria → indikator → evidence → analisis → LED → publikasi.</p></div><nav><Link href="/internal/admin">Jurusan & Prodi</Link><Link href="/internal/accreditation">Registry Framework</Link><Link href="/internal/academic">Akademik</Link><Link href="/internal/resources">Sumber Daya</Link><Link href="/internal/workflow">Workflow Domain</Link><Link href="/">Portal Publik</Link></nav></header><AccreditationCockpit assignments={assignments} permissions={session.permissions??[]}/></main>}
