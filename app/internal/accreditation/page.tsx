import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import AccreditationConsole from "./AccreditationConsole";

export const dynamic="force-dynamic";
export default async function AccreditationWorkspace(){const s=await getSession();if(!s)redirect("/internal/login");if(!can(s,"accreditation.read"))redirect("/internal");return <main className="shell"><section className="hero"><div className="eyebrow">Accreditation Framework Registry</div><h1>Framework Akreditasi Dinamis</h1><p className="muted">Lembaga, versi instrumen, klaster, kriteria, indikator, kebutuhan evidence, dan assignment ke Program Studi dikelola sebagai data. LAM Teknik 2025 tersedia sebagai seed referensi awal dan tidak otomatis ditautkan ke Prodi.</p></section><AccreditationConsole permissions={s.permissions??[]}/><p><Link href="/internal">← Dashboard internal</Link></p></main>}
