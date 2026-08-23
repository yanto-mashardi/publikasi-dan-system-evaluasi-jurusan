import mysql from "mysql2/promise";
import { loadEnvFile } from "node:process";
if(!process.env.DATABASE_URL){for(const file of [".env.local",".env"]){try{loadEnvFile(file);break}catch{}}}
async function main(){
 const url=process.env.DATABASE_URL;if(!url)throw new Error("DATABASE_URL belum dikonfigurasi.");const mode=process.env.APP_MODE?.toUpperCase()==="MASTER"?"MASTER":"TENANT",connection=await mysql.createConnection(url);
 try{const[counts]=await connection.query<mysql.RowDataPacket[]>(`SELECT (SELECT COUNT(*) FROM master_tenant_applications) masterTenants,(SELECT COUNT(*) FROM master_tenant_provisioning_jobs) provisioningJobs,(SELECT COUNT(*) FROM organizations) organizations,(SELECT COUNT(*) FROM study_programs) studyPrograms,(SELECT COUNT(*) FROM accreditation_assessments) assessments,(SELECT COUNT(*) FROM publications) publications`);const row=counts[0],warnings:string[]=[];if(mode==="MASTER"&&Number(row.assessments)>0)warnings.push("Database Master masih memuat data assessment lama. Data dipertahankan selama masa migrasi; jangan gunakan untuk input baru.");if(mode==="TENANT"&&Number(row.masterTenants)>0)warnings.push("Database Tenant memuat tabel control-plane. Tabel tidak dipakai dalam mode TENANT dan dapat dipisahkan setelah migrasi tervalidasi.");console.log(JSON.stringify({status:warnings.length?"TRANSITIONAL":"CLEAN",mode,counts:row,warnings},null,2));}
 finally{await connection.end();}
}
main().catch(error=>{console.error(error);process.exit(1)});
