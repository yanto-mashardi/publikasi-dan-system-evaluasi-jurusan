import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import PolicyConsole from "./PolicyConsole";
export const dynamic="force-dynamic";
export default async function PolicyPage(){const session=await getSession();if(!session)redirect("/internal/login");if(!(can(session,"publication.execute")||can(session,"system.configure")))redirect("/internal");return <main className="shell"><section className="hero"><div className="eyebrow">Aturan keluaran publik</div><h1>Kebijakan Publikasi Dinamis</h1><p className="muted">Super Admin menentukan tipe data, status minimum, kebutuhan persetujuan, dan field yang boleh keluar. Kajur/UPPS tetap menjadi pelaksana publikasi dalam scope-nya.</p></section><PolicyConsole canManage={can(session,"system.configure")}/><p><Link href="/internal">← Dashboard internal</Link></p></main>}
