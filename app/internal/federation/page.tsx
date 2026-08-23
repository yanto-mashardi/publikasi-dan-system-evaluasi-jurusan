import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import FederationConsole from "./FederationConsole";
import "./federation.css";
export const dynamic="force-dynamic";
export default async function FederationPage(){const session=await getSession();if(!session)redirect("/internal/login");if(!can(session,"system.configure"))redirect("/internal");return <main className="shell federation-shell"><section className="federation-hero"><div><span>Super Admin Pusat</span><h1>Monitoring Aplikasi Jurusan</h1><p>Setiap Jurusan tetap memakai aplikasi dan database sendiri. Halaman ini hanya menghubungkan ringkasan terautentikasi untuk pemantauan pusat.</p></div><div className="federation-boundary"><b>Tidak disalin ke pusat</b><span>Password, dokumen evidence, isi LED, data personal, dan transaksi rinci.</span><b>Dipantau pusat</b><span>Status aplikasi, jumlah Prodi, pengguna, assessment, gap, approval, dan publikasi.</span></div></section><FederationConsole/><p><Link href="/internal">← Dashboard Super Admin</Link></p></main>}
