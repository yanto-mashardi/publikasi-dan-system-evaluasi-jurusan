import { and,eq } from "drizzle-orm";
import { requireDb } from "../src/db";
import { accreditationAgencies,accreditationClusters,accreditationCriteria,accreditationFrameworks } from "../src/db/schema-accreditation";

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
  console.log("Accreditation seed selesai: LAM Teknik 2025 reference structure.");
}

main().catch(e=>{console.error(e);process.exit(1)});
