import Link from "next/link";
import {redirect} from "next/navigation";
import {getSession} from "@/src/lib/auth";
import {can} from "@/src/lib/rbac";
import {isMasterApplication} from "@/src/lib/application-mode";
import FederationConsole from "./FederationConsole";
import "./federation.css";
export const dynamic="force-dynamic";
export default async function FederationPage(){const session=await getSession();if(!session)redirect("/internal/login");if(!isMasterApplication()||!can(session,"system.configure"))redirect("/internal");return <main className="shell federation-shell"><section className="federation-hero"><div><span>Super Admin Master</span><h1>Monitoring Seluruh Aplikasi Jurusan</h1><p>Setiap Jurusan memakai domain dan database sendiri. Master hanya mengambil ringkasan terautentikasi melalui API federasi.</p></div><div className="federation-boundary"><b>Tidak disalin ke Master</b><span>Password, dokumen evidence, isi LED, data personal, dan transaksi rinci.</span><b>Dipantau Master</b><span>Status aplikasi, jumlah Prodi, assessment, gap, approval, dan publikasi.</span></div></section><FederationConsole/><p><Link href="/master">← Dashboard Master</Link></p></main>}
