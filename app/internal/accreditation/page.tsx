import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import AccreditationConsole from "./AccreditationConsole";
import "./registry.css";

export const dynamic="force-dynamic";
export default async function AccreditationWorkspace(){const s=await getSession();if(!s)redirect("/internal/login");if(!can(s,"accreditation.read"))redirect("/internal");const manage=can(s,"accreditation.framework.manage");return <main className="shell registry-shell"><section className="hero registry-hero"><div className="eyebrow">{manage?"Konfigurasi Super Admin":"Pilihan Kaprodi"}</div><h1>{manage?"Registry LAM dan Template Indikator":"Template Akreditasi Program Studi"}</h1><p className="muted">{manage?"Tentukan lembaga, framework versi, INPUT/PROCESS/OUTPUT, kriteria, indikator, variabel, rumus, rubrik, evidence, dan template yang tersedia untuk Prodi.":"Pilih, ganti, atau lepaskan template indikator yang sudah disediakan Super Admin. Perubahan hanya berlaku pada Program Studi dalam cakupan akun Anda."}</p></section><AccreditationConsole permissions={s.permissions??[]}/><p><Link href="/internal">← Dashboard internal</Link></p></main>}
