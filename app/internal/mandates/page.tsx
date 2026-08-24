import {redirect} from "next/navigation";
import {getSession} from "@/src/lib/auth";
import {hasRole} from "@/src/lib/rbac";
import MandateConsole from "./MandateConsole";
import "./mandates.css";

export const dynamic="force-dynamic";
export default async function MandatesPage(){const session=await getSession();if(!session)redirect("/internal/login");if(!hasRole(session,"ADMIN_DATA")&&!hasRole(session,"ADMIN_SYSTEM"))redirect("/internal");return <main className="mandate-shell"><header><span>ADMINISTRASI MANDAT</span><h1>Akun dan pembagian indikator</h1><p>Buat akun Kaprodi dan Kajur, lalu tetapkan setiap indikator menjadi tanggung jawab Prodi atau Jurusan/UPPS.</p></header><MandateConsole/></main>}
