import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import VmtsConsole from "./VmtsConsole";
import "./vmts.css";
export const dynamic="force-dynamic";
export default async function VmtsPage(){const session=await getSession();if(!session)redirect("/internal/login");return <main className="shell vmts-shell"><section className="hero vmts-hero"><div className="eyebrow">VMTS manual dan versioned</div><h1>Visi, Misi, Tujuan, dan Strategi</h1><p>Isi VMTS sesuai lingkup Jurusan/UPPS atau Program Studi. Draf dapat ditambah, diubah, dan diarsipkan. Setelah disetujui, VMTS efektif dapat dipublikasikan sesuai kebijakan publikasi.</p></section><VmtsConsole permissions={session.permissions??[]}/><p><Link href="/internal">← Dashboard internal</Link></p></main>}
