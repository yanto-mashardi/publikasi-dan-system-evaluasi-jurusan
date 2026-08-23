import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import ResourceConsole from "./ResourceConsole";
export const dynamic="force-dynamic";
export default async function ResourcesWorkspace(){const session=await getSession();if(!session)redirect("/internal/login");const allowed=["resources.read","resources.manage","resources.contribute","evaluation.create","approval.final","publication.execute"].some(p=>session.permissions?.includes(p));if(!allowed)redirect("/internal");return <main className="shell"><section className="hero"><div className="eyebrow">Resources & Extended Domains</div><h1>Sumber Daya & Tridharma</h1><p className="muted">Kelola laboratorium bersama lintas Program Studi, SDM, penelitian, PkM, mahasiswa/lulusan, dan kerja sama dalam scope organisasi yang sama. Evaluasi tetap menggunakan generic Evaluation Engine.</p></section><ResourceConsole permissions={session.permissions??[]}/><p><Link href="/internal">← Dashboard internal</Link></p></main>}
