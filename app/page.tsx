import Link from "next/link";
import { getPublicEvaluations, getPublicKpis, getPublicStatements } from "@/src/services/public-portal";
import { getSiteIdentity } from "@/src/services/site-identity";
import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
import { isMasterApplication } from "@/src/lib/application-mode";

export const dynamic = "force-dynamic";

export default async function PublicHome() {
  if(isMasterApplication())redirect((await getSession())?"/internal/accreditation":"/internal/login");
  const [kpis, statements, evaluations, identity] = await Promise.all([
    getPublicKpis(), getPublicStatements(), getPublicEvaluations(), getSiteIdentity(),
  ]);
  const vision = statements.find(s => s.type === "VISION" && s.studyProgramId == null);
  const uppsKpis = kpis.filter(k => k.studyProgramId == null);
  const services = [
    ["01", "Akademik & Kurikulum", "Kurikulum, profil lulusan, dan capaian pembelajaran.", "/akademik"],
    ["02", "Laboratorium", "Profil fasilitas, peralatan, pemanfaatan, dan keselamatan.", "/laboratorium"],
    ["03", "Riset & Pengabdian", "Penelitian, pengabdian kepada masyarakat, dan luarannya.", "/riset-pkm"],
    ["04", "Mahasiswa & Lulusan", "Data mahasiswa serta outcome lulusan yang dipublikasikan.", "/mahasiswa-lulusan"],
    ["05", "Kerja Sama", "Mitra dan implementasi kerja sama aktif.", "/kerja-sama"],
    ["06", "Berita Jurusan", "Kegiatan dan pengumuman resmi terbaru.", "/berita"],
  ];
  return <main className="public-home">
    <section className="public-hero"><div className="public-hero-copy"><span>Portal resmi informasi publik</span><h1>{identity.displayName}</h1><p>Informasi pendidikan, sumber daya, tridharma, kinerja, dan akreditasi yang telah disetujui untuk masyarakat.</p><div className="public-hero-actions"><Link href="/akademik">Jelajahi informasi</Link><Link href="/akreditasi">Lihat akreditasi</Link></div></div><div className="public-hero-mark"><b>{identity.organization?.type ?? "UPPS"}</b><span>{identity.programs.length} Program Studi aktif</span></div></section>
    <section className="public-intro"><span>Tentang jurusan</span><h2>{vision?.statement ?? "Visi resmi belum dipublikasikan oleh pengelola."}</h2>{!vision && <p className="public-disclaimer">Isi visi melalui ruang internal, selesaikan persetujuan, kemudian publikasikan.</p>}</section>
    <section className="public-services"><header><span>Informasi utama</span><h2>Temukan informasi yang Anda perlukan</h2></header><div className="public-service-grid">{services.map(([no,title,description,href]) => <Link href={href} key={href}><span>{no}</span><h3>{title}</h3><p>{description}</p><b>Selengkapnya →</b></Link>)}</div></section>
    <section className="public-performance"><header><div><span>Kinerja terpublikasi</span><h2>Ringkasan capaian Jurusan</h2></div><p>Hanya data yang telah melewati persetujuan dan kebijakan publikasi.</p></header>{uppsKpis.length ? <div className="public-kpi-grid">{uppsKpis.slice(0,4).map(k => <article key={k.id}><span>{k.code} · {k.period}</span><h3>{k.name}</h3><strong>{k.achievementPercent ? `${Number(k.achievementPercent).toFixed(1)}%` : "—"}</strong><p>Target {Number(k.targetValue)} · Realisasi {Number(k.actualValue)}</p><em>{k.publicSummary ?? "Ringkasan belum diisi."}</em></article>)}</div> : <div className="public-empty"><b>Belum ada capaian yang dipublikasikan.</b><p>Data internal tidak otomatis tampil di sini sebelum disetujui.</p></div>}</section>
    {evaluations.length > 0 && <section className="public-evaluation"><span>Perbaikan berkelanjutan</span><h2>Hasil evaluasi yang telah disahkan</h2><div>{evaluations.slice(0,3).map(e => <article key={e.id}><b>{e.subjectType} · {e.period ?? "Periode aktif"}</b><p>{e.publicSummary ?? "Ringkasan evaluasi belum tersedia."}</p>{e.followupProgress != null && <span>Tindak lanjut {e.followupProgress}%</span>}</article>)}</div></section>}
    <footer className="public-footer"><div><b>{identity.displayName}</b><p>Portal informasi publik berbasis data yang telah disetujui.</p></div><div><Link href="/akreditasi">Akreditasi</Link><Link href="/berita">Berita</Link><Link href="/internal/login">Masuk pengelola</Link></div></footer>
  </main>;
}
