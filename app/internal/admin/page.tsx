import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import AdminConsole from "./AdminConsole";

export const dynamic="force-dynamic";
export default async function AdminPage(){const s=await getSession();if(!s)redirect("/internal/login");const allowed=["master.manage","users.manage","roles.manage","news.manage","approval.final","publication.execute"].some(p=>can(s,p));if(!allowed)redirect("/internal");return <main className="shell"><section className="hero"><div className="eyebrow">Dynamic Administration Layer</div><h1>Administrasi Sistem & Konten</h1><p className="muted">Semua struktur organisasi dan konten dikelola dari database. Record yang sudah dipakai diarsipkan agar audit trail tidak hilang.</p></section><AdminConsole permissions={s.permissions}/></main>}
