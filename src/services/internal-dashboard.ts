import { and, eq, inArray } from "drizzle-orm";
import { requireDb } from "@/src/db";
import type { SessionUser } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { approvals, evaluations, followups, kpiMeasurements, publications, strategicPlans, studyPrograms } from "@/src/db/schema";
import { curricula } from "@/src/db/schema-phase5";
import { communityServiceProjects, cooperations, graduateOutcomeStats, laboratoryEquipment, laboratoryK3lChecks, laboratoryMaintenance, laboratories, laboratoryUsage, personnel, researchProjects, studentAnnualStats } from "@/src/db/schema-phase6";
import { studyProgramAccreditationFrameworks } from "@/src/db/schema-accreditation";

export type DashboardSummary = {
  input: number; process: number; output: number;
  programs: number; frameworks: number;
  submitted: number; evaluations: number; openFollowups: number; published: number;
  demoData: boolean;
};

export async function getInternalDashboardSummary(user: SessionUser): Promise<DashboardSummary> {
  const db = requireDb();
  const unrestricted = can(user, "system.configure");
  const orgIds = [...new Set((user.scopes ?? []).map((scope) => scope.organizationId))];
  const explicitProgramIds = [...new Set((user.scopes ?? []).flatMap((scope) => scope.studyProgramId == null ? [] : [scope.studyProgramId]))];
  const scopedPrograms = unrestricted
    ? await db.select({ id: studyPrograms.id }).from(studyPrograms).where(eq(studyPrograms.status, "ACTIVE"))
    : orgIds.length ? await db.select({ id: studyPrograms.id }).from(studyPrograms).where(and(inArray(studyPrograms.organizationId, orgIds), eq(studyPrograms.status, "ACTIVE"))) : [];
  const programIds = explicitProgramIds.length ? scopedPrograms.filter((program) => explicitProgramIds.includes(program.id)).map((program) => program.id) : scopedPrograms.map((program) => program.id);
  const effectiveOrgIds = unrestricted ? null : orgIds;

  const plans = effectiveOrgIds?.length ? await db.select({ id: strategicPlans.id }).from(strategicPlans).where(inArray(strategicPlans.organizationId, effectiveOrgIds)) : unrestricted ? await db.select({ id: strategicPlans.id }).from(strategicPlans) : [];
  const curriculumRows = programIds.length ? await db.select({ id: curricula.id, title: curricula.title }).from(curricula).where(inArray(curricula.studyProgramId, programIds)) : [];
  const labs = effectiveOrgIds?.length ? await db.select({ id: laboratories.id }).from(laboratories).where(inArray(laboratories.organizationId, effectiveOrgIds)) : unrestricted ? await db.select({ id: laboratories.id }).from(laboratories) : [];
  const people = effectiveOrgIds?.length ? await db.select({ id: personnel.id, name: personnel.name }).from(personnel).where(inArray(personnel.organizationId, effectiveOrgIds)) : unrestricted ? await db.select({ id: personnel.id, name: personnel.name }).from(personnel) : [];
  const cooperationRows = effectiveOrgIds?.length ? await db.select({ id: cooperations.id, partnerName: cooperations.partnerName }).from(cooperations).where(inArray(cooperations.organizationId, effectiveOrgIds)) : unrestricted ? await db.select({ id: cooperations.id, partnerName: cooperations.partnerName }).from(cooperations) : [];
  const research = effectiveOrgIds?.length ? await db.select({ id: researchProjects.id }).from(researchProjects).where(inArray(researchProjects.organizationId, effectiveOrgIds)) : unrestricted ? await db.select({ id: researchProjects.id }).from(researchProjects) : [];
  const community = effectiveOrgIds?.length ? await db.select({ id: communityServiceProjects.id }).from(communityServiceProjects).where(inArray(communityServiceProjects.organizationId, effectiveOrgIds)) : unrestricted ? await db.select({ id: communityServiceProjects.id }).from(communityServiceProjects) : [];
  const [equipment, usage, maintenance, k3l] = labs.length ? await Promise.all([
    db.select({ id: laboratoryEquipment.id }).from(laboratoryEquipment).where(inArray(laboratoryEquipment.laboratoryId, labs.map((lab) => lab.id))),
    db.select({ id: laboratoryUsage.id }).from(laboratoryUsage).where(inArray(laboratoryUsage.laboratoryId, labs.map((lab) => lab.id))),
    db.select({ id: laboratoryMaintenance.id }).from(laboratoryMaintenance),
    db.select({ id: laboratoryK3lChecks.id }).from(laboratoryK3lChecks).where(inArray(laboratoryK3lChecks.laboratoryId, labs.map((lab) => lab.id))),
  ]) : [[], [], [], []];
  const [studentStats, graduateStats, frameworks] = programIds.length ? await Promise.all([
    db.select({ id: studentAnnualStats.id }).from(studentAnnualStats).where(inArray(studentAnnualStats.studyProgramId, programIds)),
    db.select({ id: graduateOutcomeStats.id }).from(graduateOutcomeStats).where(inArray(graduateOutcomeStats.studyProgramId, programIds)),
    db.select({ id: studyProgramAccreditationFrameworks.id }).from(studyProgramAccreditationFrameworks).where(and(inArray(studyProgramAccreditationFrameworks.studyProgramId, programIds), eq(studyProgramAccreditationFrameworks.assignmentStatus, "ACTIVE"))),
  ]) : [[], [], []];
  const [measurements, evaluationRows, followupRows, approvalRows, publicationRows] = unrestricted ? await Promise.all([
    db.select({ id: kpiMeasurements.id, workflowStatus: kpiMeasurements.workflowStatus }).from(kpiMeasurements),
    db.select({ id: evaluations.id, status: evaluations.status }).from(evaluations),
    db.select({ id: followups.id, status: followups.status }).from(followups),
    db.select({ id: approvals.id }).from(approvals),
    db.select({ id: publications.id, status: publications.status }).from(publications),
  ]) : [[], [], [], [], []];
  const demoData = [...curriculumRows.map((row) => row.title), ...people.map((row) => row.name), ...cooperationRows.map((row) => row.partnerName)].some((value) => value.startsWith("CONTOH"));

  return {
    input: plans.length + curriculumRows.length + labs.length + people.length + cooperationRows.length,
    process: usage.length + maintenance.length + k3l.length + research.length + community.length + evaluationRows.length + followupRows.length,
    output: measurements.length + studentStats.length + graduateStats.length + publicationRows.length,
    programs: programIds.length,
    frameworks: frameworks.length,
    submitted: measurements.filter((row) => row.workflowStatus === "SUBMITTED").length + evaluationRows.filter((row) => row.status === "SUBMITTED").length,
    evaluations: evaluationRows.length,
    openFollowups: followupRows.filter((row) => row.status !== "CLOSED").length,
    published: publicationRows.filter((row) => row.status === "PUBLISHED").length + approvalRows.length,
    demoData,
  };
}
