import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import AccreditationConsole from "./AccreditationConsole";
import "./registry.css";
import {isMasterApplication} from "@/src/lib/application-mode";

export const dynamic="force-dynamic";
export default async function AccreditationWorkspace(){const s=await getSession();if(!s)redirect("/internal/login");if(!can(s,"accreditation.read"))redirect("/internal");const manage=isMasterApplication()&&can(s,"accreditation.framework.manage"),permissions=manage?s.permissions:(s.permissions??[]).filter(permission=>permission!=="accreditation.framework.manage");return <main className="shell registry-shell"><section className="hero registry-hero"><div className="eyebrow">{manage?"Aplikasi Master":"Pilihan Kaprodi"}</div><h1>{manage?"Registry Global LAM dan Template Indikator":"Template Akreditasi Program Studi"}</h1><p className="muted">{manage?"Master menentukan lembaga, framework versi, INPUT/PROCESS/OUTPUT, kriteria, indikator, variabel, rumus, rubrik, dan evidence yang didistribusikan ke Tenant.":"Lihat template yang telah dialokasikan Master. Kaprodi bekerja hanya pada Program Studi dalam cakupan akun."}</p></section><AccreditationConsole permissions={permissions}/><p><Link href={manage?"/master":"/internal"}>← Dashboard {manage?"Master":"internal"}</Link></p></main>}
