import Link from "next/link";
import {redirect} from "next/navigation";
import {getSession} from "@/src/lib/auth";
import {isMasterApplication} from "@/src/lib/application-mode";
export const dynamic="force-dynamic";
const roleNames:Record<string,string>={ADMIN_SYSTEM:"Super Admin Sistem",ADMIN_DATA:"Admin Jurusan",KAPRODI:"Ketua Program Studi",GKM:"Gugus Kendali Mutu",SEKJUR:"Sekretaris Jurusan",KAJUR:"Ketua Jurusan",VIEWER_INTERNAL:"Pengguna Internal"};
function ScopeCard({role,scope}:{role:string;scope:{organizationId:number;studyProgramId?:number|null}|undefined}){return <div className="workspace-identity"><span>Peran aktif</span><strong>{role}</strong><span>Cakupan kerja</span><strong>{scope?.studyProgramId?`Prodi #${scope.studyProgramId} pada Organisasi #${scope.organizationId}`:`Seluruh Prodi pada Organisasi #${scope?.organizationId??"—"}`}</strong></div>}
export default async function InternalHome(){
 const session=await getSession();if(!session)redirect("/internal/login");
 if(isMasterApplication())redirect("/master");
 const scope=session.scopes?.[0],displayRoles=session.roles.map(role=>roleNames[role]??role).join(", "),isSuperAdmin=session.roles.includes("ADMIN_SYSTEM"),isKaprodi=session.roles.includes("KAPRODI"),isKajur=session.roles.includes("KAJUR");
 if(isSuperAdmin)return <main className="workspace-home"><section className="workspace-welcome superadmin"><div><span className="workspace-kicker">Administrator teknis Tenant</span><h1>Administrasi Aplikasi Jurusan</h1><p>Akun ini hanya mengelola instalasi Jurusan ini. Provisioning Tenant, registry global LAM, dan federasi berada pada aplikasi Master.</p></div><ScopeCard role={displayRoles} scope={scope}/></section><section className="workspace-flow"><article><div className="workspace-number">01</div><div><h2>Identitas dan akun lokal</h2><p>Kelola identitas Jurusan, Prodi, pengguna, role, dan scope database Tenant ini.</p><div className="workspace-actions"><Link href="/internal/admin">Administrasi Tenant <span>→</span></Link></div></div></article><article><div className="workspace-number">02</div><div><h2>Operasional evaluasi</h2><p>Periksa pengisian, pengukuran, evaluasi, approval, dan publikasi Tenant.</p><div className="workspace-actions"><Link href="/internal/workflow">Workflow Tenant <span>→</span></Link></div></div></article></section></main>;
 const heading=isKaprodi?"Ruang kerja Kaprodi":isKajur?"Ruang kerja Kajur / UPPS":"Ruang kerja Admin Jurusan";
 const duty=isKaprodi?"Isi dan evaluasi indikator yang dimandatkan hanya dalam scope Program Studi Anda.":isKajur?"Validasi hasil pengisian dan tentukan publikasi pada lingkup UPPS/Jurusan.":"Buat akun penerima mandat dan petakan indikator kepada Prodi atau Jurusan/UPPS.";
 const steps=session.roles.includes("ADMIN_DATA")?[
  {no:"01",title:"Atur akun dan pembagian indikator",text:"Buat akun Kaprodi dan Kajur, kemudian petakan setiap indikator sekali sebagai tanggung jawab Prodi atau Jurusan/UPPS.",links:[["Kelola akun & mandat","/internal/mandates"]]},
  {no:"02",title:"Isi bagian Jurusan/UPPS",text:"Lengkapi indikator yang dimandatkan ke Jurusan/UPPS beserta data, evidence, analisis, evaluasi, dan catatan LED.",links:[["Buka cockpit akreditasi","/internal/accreditation/cockpit"],["Sumber daya Jurusan","/internal/resources"]]},
  {no:"03",title:"Pantau pekerjaan",text:"Pantau pengisian Prodi dan bagian Jurusan. Hasil yang diajukan akan masuk ke Kajur untuk validasi.",links:[["Workflow dan evaluasi","/internal/workflow"]]},
 ]:isKaprodi?[
  {no:"01",title:"Lengkapi data Program Studi",text:"Isi kurikulum, OBE, mahasiswa, lulusan, serta data Prodi yang menjadi evidence.",links:[["Akademik & OBE","/internal/academic"]]},
  {no:"02",title:"Isi indikator mandat Prodi",text:"Cockpit hanya mengizinkan Anda menyimpan indikator yang ditugaskan kepada Prodi sendiri.",links:[["Cockpit akreditasi","/internal/accreditation/cockpit"]]},
  {no:"03",title:"Ajukan kepada Kajur",text:"Lengkapi perhitungan, analisis, evaluasi, dan LED, kemudian ajukan untuk divalidasi Kajur.",links:[["Workflow evaluasi","/internal/workflow"]]},
 ]:[
  {no:"01",title:"Periksa pengajuan",text:"Tinjau hasil pengisian indikator dari Prodi dan Jurusan/UPPS.",links:[["Cockpit akreditasi","/internal/accreditation/cockpit"]]},
  {no:"02",title:"Validasi atau kembalikan",text:"Validasi hasil yang lengkap atau kembalikan kepada penanggung jawab bila perlu diperbaiki.",links:[["Antrian evaluasi","/internal/workflow"]]},
  {no:"03",title:"Tetapkan publikasi",text:"Publikasikan hanya hasil yang disetujui dan memang ditandai sebagai kandidat informasi publik.",links:[["Portal publik","/"],["Informasi akreditasi","/akreditasi"]]},
 ];
 return <main className="workspace-home"><section className="workspace-welcome"><div><span className="workspace-kicker">{heading}</span><h1>Selamat datang, {session.name}</h1><p>{duty}</p></div><ScopeCard role={displayRoles} scope={scope}/></section><section className="workspace-flow">{steps.map(step=><article key={step.no}><div className="workspace-number">{step.no}</div><div><h2>{step.title}</h2><p>{step.text}</p><div className="workspace-actions">{step.links.map(([label,href])=><Link key={href} href={href}>{label}<span>→</span></Link>)}</div></div></article>)}</section><aside className="workspace-note"><strong>{isKaprodi?"Kaprodi: input dan evaluasi hanya pada indikator yang dimandatkan ke Prodi sendiri.":isKajur?"Kajur/UPPS: validator hasil pengisian dan pelaksana publikasi pada lingkup UPPS.":"Admin Jurusan: pembuat akun, pembagi mandat indikator, dan pengisi bagian UPPS/Jurusan."}</strong><p>Master menetapkan instrumen LAM. Tenant membagi pekerjaan tanpa mengubah isi template global.</p></aside></main>;
}
