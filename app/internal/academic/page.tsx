import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/src/lib/auth";
import AcademicConsole from "./AcademicConsole";
export const dynamic="force-dynamic";
export default async function AcademicWorkspace(){const session=await getSession();if(!session)redirect("/internal/login");const allowed=["curriculum.manage","data.create","data.update","evaluation.create","approval.final","publication.execute","internal.read"].some(p=>session.permissions?.includes(p));if(!allowed)redirect("/internal");return <main className="shell"><section className="hero"><div className="eyebrow">Academic & OBE Workspace</div><h1>Kurikulum dan Evaluasi OBE</h1><p className="muted">Kurikulum dikelola per Program Studi, versioned, dievaluasi melalui generic Evaluation Engine, lalu dipublikasikan setelah approval.</p></section><AcademicConsole permissions={session.permissions??[]}/><p><Link href="/internal">← Dashboard internal</Link></p></main>}
