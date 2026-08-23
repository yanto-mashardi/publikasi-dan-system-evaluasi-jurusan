import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { isMasterApplication } from "@/src/lib/application-mode";
import MasterConsole from "./MasterConsole";
import "./master.css";
export const dynamic="force-dynamic";
export default async function MasterPage(){const session=await getSession();if(!session)redirect("/internal/login");if(!isMasterApplication()||!can(session,"system.configure"))redirect("/internal");return <main className="master-shell"><header><span>CONTROL PLANE</span><h1>Master Aplikasi Jurusan</h1><p>Buat Tenant baru, siapkan database terpisah, distribusikan konfigurasi, dan pantau seluruh Jurusan melalui federasi.</p></header><MasterConsole/></main>}
