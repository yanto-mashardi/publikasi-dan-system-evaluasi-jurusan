import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession, type SessionUser } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { getInternalDashboardSummary } from "@/src/services/internal-dashboard";
import "./dashboard.css";
import "./dashboard-shell.css";
import "./dashboard-live.css";

export const dynamic = "force-dynamic";

type NavigationItem = { title: string; description: string; href?: string; permissions?: string[] };

const operationalNavigation: NavigationItem[] = [
  { title: "Perencanaan", description: "VMTS, Renstra, sasaran strategis, KPI, dan target." },
  { title: "Akademik & OBE", description: "Kurikulum, profil lulusan, CPL, CPMK, dan evaluasi kurikulum.", href: "/internal/academic", permissions: ["curriculum.manage", "data.create", "data.update", "evaluation.create", "approval.final", "publication.execute", "internal.read"] },
  { title: "Sumber Daya & Tridharma", description: "Laboratorium, SDM, penelitian, PkM, mahasiswa/lulusan, dan kerja sama.", href: "/internal/resources", permissions: ["resources.read", "resources.manage", "resources.contribute", "evaluation.create", "approval.final", "publication.execute"] },
  { title: "Kinerja", description: "Realisasi KPI, perhitungan capaian, dan evidence." },
  { title: "Mutu", description: "Evaluasi, temuan, rekomendasi, tindak lanjut, dan verifikasi." },
  { title: "Akreditasi", description: "Framework, kriteria, indikator, kebutuhan evidence, dan assignment Prodi.", href: "/internal/accreditation", permissions: ["accreditation.read"] },
  { title: "Publikasi", description: "Proyeksi record yang telah disahkan ke portal publik." },
];

const ipoColumns = [
  { key: "01", title: "Input", subtitle: "Masukan", description: "Kondisi, sumber daya, kebijakan, standar, rencana, dan desain yang menjadi prasyarat penyelenggaraan.", groups: [
    { label: "Arah & tata kelola", items: "Organisasi UPPS dan Prodi, VMTS, Renstra, standar, target KPI" },
    { label: "Akademik", items: "Kurikulum, profil lulusan, CPL, CPMK, mata kuliah, mahasiswa input" },
    { label: "Sumber daya", items: "SDM, laboratorium, equipment, kapasitas, kesiapan K3L" },
    { label: "Pendukung", items: "Roadmap tridharma, kerja sama, dan sumber pendukung" },
  ] },
  { key: "02", title: "Process", subtitle: "Proses", description: "Pelaksanaan, pengendalian, pengukuran, evaluasi, dan peningkatan terhadap masukan yang dikelola.", groups: [
    { label: "Pelaksanaan", items: "Renstra dan program kerja, pembelajaran/OBE, penelitian, PkM" },
    { label: "Pengelolaan sumber daya", items: "Penggunaan laboratorium, maintenance, pemeriksaan K3L" },
    { label: "Pengendalian mutu", items: "Measurement KPI, evidence, evaluasi, temuan, dan rekomendasi" },
    { label: "Keputusan", items: "Tindak lanjut, verifikasi efektivitas, approval, dan governance decision" },
  ] },
  { key: "03", title: "Output / Outcome", subtitle: "Luaran & dampak", description: "Hasil yang menunjukkan performa, efektivitas proses, dan dampak penyelenggaraan yang dapat ditelusuri.", groups: [
    { label: "Kinerja", items: "Capaian KPI, sasaran, dan status target" },
    { label: "Akademik & lulusan", items: "Capaian CPL, kelulusan, masa studi, dan outcome lulusan" },
    { label: "Tridharma & sumber daya", items: "Luaran penelitian/PkM, hasil kerja sama, kinerja pemanfaatan sumber daya" },
    { label: "Peningkatan & transparansi", items: "Efektivitas tindak lanjut, laporan, dan informasi yang telah disahkan" },
  ] },
];

function allowed(user: SessionUser, item: NavigationItem) {
  return !item.permissions || item.permissions.some((permission) => can(user, permission));
}

export default async function InternalDashboard() {
  const session = await getSession();
  if (!session) redirect("/internal/login");
  const navigation = operationalNavigation.filter((item) => allowed(session, item));
  const adminAllowed = ["master.manage", "users.manage", "roles.manage", "news.manage", "approval.final", "publication.execute"].some((permission) => can(session, permission));
  const scopeCount = session.scopes?.length ?? 0;
  const summary = await getInternalDashboardSummary(session);
  const ipoCounts = [summary.input, summary.process, summary.output];

  return <main className="internal-dashboard">
    <header className="dashboard-header">
      <div><div className="dashboard-brand">UPPS Governance</div><p>Workspace internal</p></div>
      <div className="dashboard-user">
        <div><strong>{session.name}</strong><span>{(session.roles ?? []).join(", ") || "Pengguna internal"}</span></div>
        <form action="/api/auth/logout" method="post"><button className="dashboard-logout" type="submit">Keluar</button></form>
      </div>
    </header>

    <div className="dashboard-layout">
      <aside className="dashboard-sidebar" aria-label="Navigasi domain operasional">
        <div className="sidebar-heading"><span>Domain operasional</span><p>Kelola data sumber melalui modul yang tersedia.</p></div>
        <nav className="domain-nav">
          {navigation.map((item, index) => item.href ? <Link className="domain-nav-item" href={item.href} key={item.title}>
            <span className="domain-number">{String(index + 1).padStart(2, "0")}</span>
            <span><strong>{item.title}</strong><small>{item.description}</small></span><span className="domain-arrow" aria-hidden="true">→</span>
          </Link> : <div className="domain-nav-item domain-nav-item-static" key={item.title}>
            <span className="domain-number">{String(index + 1).padStart(2, "0")}</span><span><strong>{item.title}</strong><small>{item.description}</small></span>
          </div>)}
        </nav>
        {adminAllowed && <Link className="admin-link" href="/internal/admin"><span>Administrasi sistem</span><small>Organisasi, Prodi, pengguna, role, dan berita</small></Link>}
      </aside>

      <div className="dashboard-content">
        <section className="dashboard-intro">
          <div><div className="dashboard-kicker">Accreditation & governance view</div><h1>Tata kelola UPPS dalam satu ruang kerja.</h1><p>Ringkasan ini dihitung dari record operasional yang sama. Gunakan domain di sebelah kiri untuk memperbarui sumber datanya.</p>{summary.demoData && <span className="demo-badge">Mode data contoh · record berawalan CONTOH</span>}</div>
          <div className="access-context" aria-label="Konteks akses pengguna"><span>Konteks akses</span><strong>{scopeCount > 0 ? `${scopeCount} scope organisasi / Prodi` : "Mengikuti permission pengguna"}</strong><small>Framework, Prodi, dan periode dipilih di modul terkait saat datanya tersedia.</small></div>
        </section>

        <section className="overview-grid" aria-label="Ringkasan ruang kerja">
          <div><span>Program studi aktif</span><strong>{summary.programs}</strong><small>sesuai scope akses</small></div>
          <div><span>Framework tertaut</span><strong>{summary.frameworks}</strong><small>assignment aktif</small></div>
          <div><span>Menunggu proses</span><strong>{summary.submitted}</strong><small>record submitted</small></div>
          <div><span>Evaluasi</span><strong>{summary.evaluations}</strong><small>record evaluasi</small></div>
          <div><span>Tindak lanjut terbuka</span><strong>{summary.openFollowups}</strong><small>perlu diselesaikan</small></div>
          <div><span>Disahkan / terbit</span><strong>{summary.published}</strong><small>approval dan publikasi</small></div>
        </section>

        <section className="ipo-section" aria-labelledby="ipo-heading">
          <div className="section-heading-row"><div><span className="section-label">Peta data tata kelola</span><h2 id="ipo-heading">Input → Process → Output / Outcome</h2></div>{can(session,"accreditation.read") && <Link className="text-link" href="/internal/accreditation">Buka registry akreditasi →</Link>}</div>
          <div className="ipo-grid">{ipoColumns.map((column, columnIndex) => <article className={`ipo-card ipo-card-${columnIndex + 1}`} key={column.title}>
            <div className="ipo-card-head"><span>{column.key}</span><div><p>{column.subtitle}</p><h3>{column.title}</h3></div><div className="record-count"><strong>{ipoCounts[columnIndex]}</strong><small>record tersedia</small></div></div>
            <p className="ipo-description">{column.description}</p>
            <div className="ipo-groups">{column.groups.map((group) => <div className="ipo-group" key={group.label}><strong>{group.label}</strong><p>{group.items}</p></div>)}</div>
            {columnIndex < ipoColumns.length - 1 && <span className="ipo-connector" aria-hidden="true">→</span>}
          </article>)}</div>
          <p className="dashboard-note">Angka di atas adalah jumlah record sumber yang tersedia, bukan skor readiness. Readiness baru ditampilkan setelah aturan Phase 7 tersedia.</p>
        </section>

        <section className="workspace-actions" aria-labelledby="actions-heading">
          <div><span className="section-label">Mulai bekerja</span><h2 id="actions-heading">Buka data sumber</h2><p>Data contoh dapat langsung diperiksa, diubah, atau diganti admin melalui modul yang sudah tersedia.</p></div>
          <div className="action-links">
            {allowed(session, operationalNavigation[1]) && <Link href="/internal/academic"><strong>Akademik & OBE</strong><span>Kurikulum, profil lulusan, CPL, dan review →</span></Link>}
            {allowed(session, operationalNavigation[2]) && <Link href="/internal/resources"><strong>Sumber Daya & Tridharma</strong><span>Lab, SDM, riset, PkM, mahasiswa, kerja sama →</span></Link>}
            {allowed(session, operationalNavigation[5]) && <Link href="/internal/accreditation"><strong>Registry Akreditasi</strong><span>Framework, struktur, dan assignment Prodi →</span></Link>}
            {adminAllowed && <Link href="/internal/admin"><strong>Administrasi Sistem</strong><span>Organisasi, Prodi, pengguna, role, dan berita →</span></Link>}
          </div>
        </section>

        <section className="governance-strip" aria-labelledby="workflow-heading">
          <div className="governance-copy"><span className="section-label">Lifecycle record</span><h2 id="workflow-heading">Dari data kerja menjadi informasi yang sah</h2><p>Setiap domain tetap memakai backend dinamis, RBAC, audit trail, evaluasi, approval, dan publication layer yang sudah ada.</p></div>
          <ol className="lifecycle"><li><span>01</span><strong>Draft</strong></li><li><span>02</span><strong>Submitted</strong></li><li><span>03</span><strong>Verified / Evaluated</strong><small>bila relevan</small></li><li><span>04</span><strong>Approved</strong></li><li><span>05</span><strong>Effective</strong></li><li><span>06</span><strong>Published</strong></li></ol>
        </section>
        <footer className="dashboard-footer"><span>Internal Governance Workspace</span><div><Link href="/">Portal publik</Link><Link href="/api/health">Status sistem</Link></div></footer>
      </div>
    </div>
  </main>;
}
