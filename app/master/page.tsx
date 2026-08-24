import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { isMasterApplication } from "@/src/lib/application-mode";
import MasterConsole from "./MasterConsole";
import "./master.css";
export const dynamic="force-dynamic";
export default async function MasterPage(){const session=await getSession();if(!session)redirect("/internal/login");if(!isMasterApplication()||!can(session,"system.configure"))redirect("/internal");return <main className="master-shell"><header><span>CONTROL PLANE</span><h1>Master Aplikasi Jurusan</h1><p>Ikuti urutan kerja berikut. Aplikasi Jurusan tidak dapat dibuat sebelum template LAM aktif tersedia.</p></header><section className="master-steps" aria-label="Urutan konfigurasi Master"><a href="/internal/accreditation"><b>01</b><span><strong>Siapkan Template LAM</strong><small>Lembaga → framework DRAFT → upload Excel → aktifkan</small></span></a><a href="/master" className="current"><b>02</b><span><strong>Buat Aplikasi Jurusan</strong><small>Domain, database, Prodi, template, dan admin</small></span></a><div><b>03</b><span><strong>Onlinekan Tenant</strong><small>Pasang codebase pada domain dan database baru</small></span></div><a href="/internal/federation"><b>04</b><span><strong>Pantau Federasi</strong><small>Sinkronkan ringkasan seluruh Jurusan</small></span></a></section><MasterConsole/></main>}
