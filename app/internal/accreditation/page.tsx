import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import AccreditationConsole from "./AccreditationConsole";
import "./registry.css";

export const dynamic="force-dynamic";
export default async function AccreditationWorkspace(){const s=await getSession();if(!s)redirect("/internal/login");if(!can(s,"accreditation.read"))redirect("/internal");return <main className="shell registry-shell"><section className="hero registry-hero"><div className="eyebrow">Konfigurasi Super Admin</div><h1>Registry Instrumen Akreditasi</h1><p className="muted">Kelola urutan lengkap: lembaga → framework versi → INPUT/PROCESS/OUTPUT → kriteria → indikator → variabel dan rumus → rubrik → evidence → assignment Prodi. Data DRAFT dapat ditambah, diubah, dan diarsipkan; versi ACTIVE dikunci untuk menjaga audit.</p></section><AccreditationConsole permissions={s.permissions??[]}/><p><Link href="/internal">← Dashboard internal</Link></p></main>}
