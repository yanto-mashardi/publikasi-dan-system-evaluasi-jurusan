import {redirect} from "next/navigation";
import {getSession} from "@/src/lib/auth";
import {hasRole} from "@/src/lib/rbac";
import MandateConsole from "./MandateConsole";
import "./mandates.css";
import "./module-sources.css";

export const dynamic="force-dynamic";
export default async function MandatesPage(){const session=await getSession();if(!session)redirect("/internal/login");if(!hasRole(session,"ADMIN_DATA")&&!hasRole(session,"ADMIN_SYSTEM"))redirect("/internal");return <main className="mandate-shell"><header><span>ADMINISTRASI MANDAT</span><h1>Akun, mandat, dan sumber modul</h1><p>Tetapkan penanggung jawab indikator serta modul operasional yang menjadi sumber perhitungannya.</p></header><MandateConsole/></main>}
