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
  if (!can(session, "system.configure")) redirect("/internal");
  const db = requireDb();
  const [plans, goals, kpiRows, targets, measurements, evaluationRows, recommendationRows, followupRows, approvalRows, publicationRows] = await Promise.all([
    db.select().from(strategicPlans), db.select().from(strategicGoals), db.select().from(kpis), db.select().from(kpiTargets), db.select().from(kpiMeasurements), db.select().from(evaluations), db.select().from(recommendations), db.select().from(followups), db.select().from(approvals), db.select().from(publications),
  ]);
  return <main className="workflow-shell">
    <header className="workflow-header"><div><span>Workflow Tata Kelola</span><h1>Dari target hingga publikasi</h1><p>Setiap tombol di halaman ini menjalankan backend, permission, lifecycle, dan audit trail yang sudah ada.</p></div><Link href="/internal">← Dashboard</Link></header>
    <WorkflowConsole initialData={{plans,goals,kpis:kpiRows,targets,measurements,evaluations:evaluationRows,recommendations:recommendationRows,followups:followupRows,approvals:approvalRows,publications:publicationRows}} />
  </main>;
}
