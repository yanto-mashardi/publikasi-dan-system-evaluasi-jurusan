import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import AdminConsole from "./AdminConsole";

export const dynamic="force-dynamic";
export default async function AdminPage(){const s=await getSession();if(!s)redirect("/internal/login");const allowed=["master.manage","users.manage","roles.manage","news.manage","approval.final","publication.execute"].some(p=>can(s,p));if(!allowed)redirect("/internal");const systemAdmin=can(s,"system.configure")||can(s,"master.manage");return <main className="shell"><section className="hero"><div className="eyebrow">{systemAdmin?"Khusus Super Admin":"Ruang kerja Admin Jurusan"}</div><h1>{systemAdmin?"Administrasi Sistem":"Berita dan Konten Jurusan"}</h1><p className="muted">{systemAdmin?"Kelola struktur Jurusan/UPPS, Program Studi, akun, role, permission, dan konfigurasi sistem.":"Buat berita dalam cakupan Jurusan, ajukan untuk disetujui, lalu publikasikan sesuai lifecycle."}</p></section><AdminConsole permissions={s.permissions}/></main>}
