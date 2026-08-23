import Link from "next/link";
import { redirect } from "next/navigation";
import { requireDb } from "@/src/db";
import { approvals, evaluations, followups, kpiMeasurements, kpis, kpiTargets, publications, recommendations, strategicGoals, strategicPlans } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import WorkflowConsole from "./WorkflowConsole";
import "./workflow.css";

export const dynamic = "force-dynamic";

export default async function WorkflowPage() {
  const session = await getSession();
  if (!session) redirect("/internal/login");
  if (!["system.configure","data.create","data.update","kpi.measure","evaluation.create"].some(permission=>can(session,permission))) redirect("/internal");
  const db = requireDb();
  const [plans, goals, kpiRows, targets, measurements, evaluationRows, recommendationRows, followupRows, approvalRows, publicationRows] = await Promise.all([
    db.select().from(strategicPlans), db.select().from(strategicGoals), db.select().from(kpis), db.select().from(kpiTargets), db.select().from(kpiMeasurements), db.select().from(evaluations), db.select().from(recommendations), db.select().from(followups), db.select().from(approvals), db.select().from(publications),
  ]);
  const unrestricted=can(session,"system.configure"),organizationIds=new Set(session.scopes.map(scope=>scope.organizationId));
  const scopedPlans=unrestricted?plans:plans.filter(row=>organizationIds.has(row.organizationId));
  const scopedGoals=unrestricted?goals:goals.filter(row=>organizationIds.has(row.organizationId));
  const scopedKpis=unrestricted?kpiRows:kpiRows.filter(row=>organizationIds.has(row.ownerOrganizationId));
  const kpiIds=new Set(scopedKpis.map(row=>row.id));
  const scopedTargets=targets.filter(row=>kpiIds.has(row.kpiId)),scopedMeasurements=measurements.filter(row=>kpiIds.has(row.kpiId));
  const measurementIds=new Set(scopedMeasurements.map(row=>row.id));
  const scopedEvaluations=unrestricted?evaluationRows:evaluationRows.filter(row=>(row.subjectType==="KPI"&&kpiIds.has(row.subjectId))||(row.subjectType==="KPI_MEASUREMENT"&&(measurementIds.has(row.subjectId)||kpiIds.has(row.subjectId))));
  const evaluationIds=new Set(scopedEvaluations.map(row=>row.id)),scopedRecommendations=recommendationRows.filter(row=>evaluationIds.has(row.evaluationId));
  const recommendationIds=new Set(scopedRecommendations.map(row=>row.id)),scopedFollowups=followupRows.filter(row=>recommendationIds.has(row.recommendationId));
  const allowedSubjects=new Set([...kpiIds,...measurementIds,...evaluationIds]);
  const scopedApprovals=unrestricted?approvalRows:approvalRows.filter(row=>allowedSubjects.has(row.subjectId));
  const scopedPublications=unrestricted?publicationRows:publicationRows.filter(row=>allowedSubjects.has(row.subjectId));
  return <main className="workflow-shell">
    <header className="workflow-header"><div><span>Workflow Tata Kelola</span><h1>Dari target hingga publikasi</h1><p>Setiap tombol di halaman ini menjalankan backend, permission, lifecycle, dan audit trail yang sudah ada.</p></div><Link href="/internal">← Dashboard</Link></header>
    <WorkflowConsole initialData={{plans:scopedPlans,goals:scopedGoals,kpis:scopedKpis,targets:scopedTargets,measurements:scopedMeasurements,evaluations:scopedEvaluations,recommendations:scopedRecommendations,followups:scopedFollowups,approvals:scopedApprovals,publications:scopedPublications}} />
  </main>;
}
