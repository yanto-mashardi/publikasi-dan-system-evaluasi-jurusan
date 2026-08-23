import { and,eq } from "drizzle-orm";
import { requireDb } from "../src/db";
import { accreditationAgencies,accreditationClusters,accreditationCriteria,accreditationEvidenceRequirements,accreditationFrameworks,accreditationIndicatorClusters,accreditationIndicators } from "../src/db/schema-accreditation";

const LAM_TEKNIK_SOURCE="https://lamteknik.or.id/akreditasi/instrumen-akreditasi";
const LAM_TEKNIK_REGULATION="Peraturan LAM Teknik Nomor 6 Tahun 2025";

const CLUSTERS=[
  {code:"INPUT",name:"Input / Masukan",semanticGroup:"INPUT",sequence:1,description:"Sumber daya, standar, perencanaan, struktur, dan prasyarat penyelenggaraan."},
  {code:"PROCESS",name:"Process / Proses",semanticGroup:"PROCESS",sequence:2,description:"Pelaksanaan, tata kelola, pengendalian, evaluasi, PPEPP, dan tindak lanjut."},
  {code:"OUTPUT_OUTCOME",name:"Output / Outcome",semanticGroup:"OUTPUT_OUTCOME",sequence:3,description:"Luaran, capaian, dampak, kinerja, dan efektivitas peningkatan mutu."},
];

const CRITERIA=[
  {code:"K1",name:"Diferensiasi Misi (Visi, Misi, Tujuan, dan Strategi)",sequence:1},
  {code:"K2",name:"Akuntabilitas",sequence:2},
  {code:"K3",name:"Relevansi Pendidikan, Penelitian, dan PkM",sequence:3},
  {code:"K4",name:"Sumber Daya Manusia",sequence:4},
  {code:"K5",name:"Sarana, Prasarana, dan Keselamatan Kesehatan Kerja dan Lingkungan (K3L)",sequence:5},
  {code:"K6",name:"Mahasiswa dan Luaran Mahasiswa",sequence:6},
  {code:"K7",name:"Sistem Penjaminan Mutu",sequence:7},
];
const DEMO_INDICATORS=[
  {code:"CONTOH-K1-I1",name:"Ketersediaan VMTS, Renstra, sasaran, dan target Prodi",criterion:"K1",cluster:"INPUT",subjectTypes:["STRATEGIC_PLAN","STRATEGIC_STATEMENT","KPI"]},
  {code:"CONTOH-K2-I1",name:"Pelaksanaan tata kelola, approval, dan keterlacakan keputusan",criterion:"K2",cluster:"PROCESS",subjectTypes:["APPROVAL","AUDIT_LOG"]},
  {code:"CONTOH-K3-I1",name:"Kesesuaian kurikulum, CPL, penelitian, dan PkM dengan kebutuhan pemangku kepentingan",criterion:"K3",cluster:"PROCESS",subjectTypes:["CURRICULUM","RESEARCH_PROJECT","COMMUNITY_SERVICE_PROJECT"]},
  {code:"CONTOH-K4-I1",name:"Ketersediaan dan kualifikasi SDM sesuai kebutuhan penyelenggaraan",criterion:"K4",cluster:"INPUT",subjectTypes:["PERSONNEL"]},
  {code:"CONTOH-K5-I1",name:"Ketersediaan laboratorium, peralatan, dan kesiapan K3L",criterion:"K5",cluster:"INPUT",subjectTypes:["LABORATORY_PROFILE","LAB_EQUIPMENT","LAB_K3L"]},
  {code:"CONTOH-K5-I2",name:"Pemanfaatan dan pemeliharaan laboratorium",criterion:"K5",cluster:"PROCESS",subjectTypes:["LAB_USAGE","LAB_MAINTENANCE"]},
  {code:"CONTOH-K6-I1",name:"Capaian mahasiswa, kelulusan, dan outcome lulusan",criterion:"K6",cluster:"OUTPUT_OUTCOME",subjectTypes:["STUDENT_ANNUAL_STAT","GRADUATE_OUTCOME_STAT"]},
  {code:"CONTOH-K7-I1",name:"Pelaksanaan evaluasi, temuan, rekomendasi, dan tindak lanjut",criterion:"K7",cluster:"PROCESS",subjectTypes:["EVALUATION","FOLLOWUP"]},
  {code:"CONTOH-K7-I2",name:"Efektivitas peningkatan mutu dan informasi yang telah disahkan",criterion:"K7",cluster:"OUTPUT_OUTCOME",subjectTypes:["FOLLOWUP","PUBLICATION"]},
];

async function main(){
  const db=requireDb();
  let[agency]=await db.select().from(accreditationAgencies).where(eq(accreditationAgencies.code,"LAM_TEKNIK")).limit(1);
  if(!agency){
    const x=await db.insert(accreditationAgencies).values({code:"LAM_TEKNIK",name:"Lembaga Akreditasi Mandiri Program Studi Keteknikan",agencyType:"LAM",websiteUrl:"https://lamteknik.or.id",status:"ACTIVE"});
    [agency]=await db.select().from(accreditationAgencies).where(eq(accreditationAgencies.id,Number(x[0].insertId))).limit(1);
  }

  let[framework]=await db.select().from(accreditationFrameworks).where(and(eq(accreditationFrameworks.agencyId,agency.id),eq(accreditationFrameworks.code,"LAMTEKNIK-2025-REFERENCE"),eq(accreditationFrameworks.versionNumber,1))).limit(1);
  if(!framework){
    const x=await db.insert(accreditationFrameworks).values({
      agencyId:agency.id,
      code:"LAMTEKNIK-2025-REFERENCE",
      name:"LAM Teknik 2025 — Reference Structure",
      instrumentYear:2025,
      instrumentType:"REFERENCE_STRUCTURE",
      regulationReference:LAM_TEKNIK_REGULATION,
      sourceUrl:LAM_TEKNIK_SOURCE,
      versionNumber:1,
      lifecycleStatus:"ACTIVE",
      notes:"Seed struktur umum: IPO + 7 kriteria. Indikator scoring harus mengikuti matriks spesifik jenjang/skema dan tidak dicampur lintas instrumen.",
    });
    [framework]=await db.select().from(accreditationFrameworks).where(eq(accreditationFrameworks.id,Number(x[0].insertId))).limit(1);
  }

  for(const c of CLUSTERS){
    const[found]=await db.select().from(accreditationClusters).where(and(eq(accreditationClusters.frameworkId,framework.id),eq(accreditationClusters.code,c.code))).limit(1);
    if(!found)await db.insert(accreditationClusters).values({frameworkId:framework.id,...c,status:"ACTIVE"});
  }
  for(const c of CRITERIA){
    const[found]=await db.select().from(accreditationCriteria).where(and(eq(accreditationCriteria.frameworkId,framework.id),eq(accreditationCriteria.code,c.code))).limit(1);
    if(!found)await db.insert(accreditationCriteria).values({frameworkId:framework.id,...c,status:"ACTIVE"});
  }
  let[demo]=await db.select().from(accreditationFrameworks).where(and(eq(accreditationFrameworks.agencyId,agency.id),eq(accreditationFrameworks.code,"LAMTEKNIK-2025-DEMO-D3"),eq(accreditationFrameworks.versionNumber,1))).limit(1);
  if(!demo){const x=await db.insert(accreditationFrameworks).values({agencyId:agency.id,code:"LAMTEKNIK-2025-DEMO-D3",name:"LAM Teknik 2025 - Konfigurasi Demo D3",instrumentYear:2025,instrumentType:"DEMO_CONFIGURATION",educationLevel:"D3",versionNumber:1,lifecycleStatus:"DRAFT",notes:"CONTOH untuk simulasi aplikasi. Bukan matriks penilaian resmi; ganti dengan indikator instrumen resmi sebelum penggunaan institusional."});[demo]=await db.select().from(accreditationFrameworks).where(eq(accreditationFrameworks.id,Number(x[0].insertId))).limit(1);}
  for(const c of CLUSTERS){const[found]=await db.select().from(accreditationClusters).where(and(eq(accreditationClusters.frameworkId,demo.id),eq(accreditationClusters.code,c.code))).limit(1);if(!found)await db.insert(accreditationClusters).values({frameworkId:demo.id,...c,status:"ACTIVE"});}
  for(const c of CRITERIA){const[found]=await db.select().from(accreditationCriteria).where(and(eq(accreditationCriteria.frameworkId,demo.id),eq(accreditationCriteria.code,c.code))).limit(1);if(!found)await db.insert(accreditationCriteria).values({frameworkId:demo.id,...c,status:"ACTIVE"});}
  const demoCriteria=await db.select().from(accreditationCriteria).where(eq(accreditationCriteria.frameworkId,demo.id));const demoClusters=await db.select().from(accreditationClusters).where(eq(accreditationClusters.frameworkId,demo.id));
  for(const item of DEMO_INDICATORS){let[indicator]=await db.select().from(accreditationIndicators).where(and(eq(accreditationIndicators.frameworkId,demo.id),eq(accreditationIndicators.code,item.code))).limit(1);if(!indicator){const criterion=demoCriteria.find(row=>row.code===item.criterion)!;const x=await db.insert(accreditationIndicators).values({frameworkId:demo.id,criterionId:criterion.id,code:item.code,name:`CONTOH - ${item.name}`,description:"Indikator demonstrasi untuk menguji alur aplikasi; bukan rumusan resmi LAM Teknik.",sequence:1,status:"ACTIVE"});[indicator]=await db.select().from(accreditationIndicators).where(eq(accreditationIndicators.id,Number(x[0].insertId))).limit(1);}const cluster=demoClusters.find(row=>row.code===item.cluster)!;await db.insert(accreditationIndicatorClusters).values({indicatorId:indicator.id,clusterId:cluster.id,isPrimary:true}).onDuplicateKeyUpdate({set:{isPrimary:true}});const[requirement]=await db.select().from(accreditationEvidenceRequirements).where(and(eq(accreditationEvidenceRequirements.indicatorId,indicator.id),eq(accreditationEvidenceRequirements.code,`${item.code}-EV`))).limit(1);if(!requirement)await db.insert(accreditationEvidenceRequirements).values({indicatorId:indicator.id,code:`${item.code}-EV`,description:`CONTOH - Data/evidence sumber untuk ${item.name}.`,required:true,acceptableSubjectTypes:item.subjectTypes,status:"ACTIVE"});}
  if(demo.lifecycleStatus!=="ACTIVE")await db.update(accreditationFrameworks).set({lifecycleStatus:"ACTIVE",effectiveFrom:"2026-01-01",updatedAt:new Date()}).where(eq(accreditationFrameworks.id,demo.id));
  console.log("Accreditation seed selesai: LAM Teknik 2025 reference structure.");
}

main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
