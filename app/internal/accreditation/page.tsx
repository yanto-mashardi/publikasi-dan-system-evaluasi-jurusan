import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import AccreditationConsole from "./AccreditationConsole";
import "./registry.css";
import "./template-flow.css";
import {isMasterApplication} from "@/src/lib/application-mode";

export const dynamic="force-dynamic";
export default async function AccreditationWorkspace(){const s=await getSession();if(!s)redirect("/internal/login");if(!can(s,"accreditation.read"))redirect("/internal");const manage=isMasterApplication()&&can(s,"accreditation.framework.manage"),permissions=manage?s.permissions:(s.permissions??[]).filter(permission=>permission!=="accreditation.framework.manage");return <main className="shell registry-shell"><section className="hero registry-hero"><div className="eyebrow">{manage?"LANGKAH 1 · APLIKASI MASTER":"TEMPLATE DARI MASTER"}</div><h1>{manage?"Siapkan Template LAM Terlebih Dahulu":"Template Akreditasi Program Studi"}</h1><p className="muted">{manage?"Selesaikan lima tahap di bawah sampai framework berstatus ACTIVE. Setelah itu kembali ke menu 2. Aplikasi Jurusan untuk memasangkannya ke Prodi.":"Template ditentukan oleh Super Admin Master. Kaprodi mengisi, menghitung, dan mengevaluasi indikator dalam scope Prodinya."}</p></section>{manage&&<section className="template-steps" aria-label="Urutan membuat template LAM"><div><b>1</b><span><strong>Tambah LAM</strong><small>Contoh: LAM Teknik</small></span></div><div><b>2</b><span><strong>Buat Framework DRAFT</strong><small>Isi kode, jenjang, tahun, dan sumber resmi</small></span></div><div><b>3</b><span><strong>Pilih Framework</strong><small>Pilih DRAFT pada daftar framework</small></span></div><div><b>4</b><span><strong>Upload Excel</strong><small>Unduh format, isi indikator, lalu impor</small></span></div><div><b>5</b><span><strong>Periksa & Aktifkan</strong><small>Pastikan struktur benar sebelum dikunci</small></span></div></section>}<AccreditationConsole permissions={permissions}/><p><Link href={manage?"/master":"/internal"}>← Dashboard {manage?"Master":"internal"}</Link></p></main>}
