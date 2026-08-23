import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

const tenantTables=[
  "organizations","study_programs","users","roles","permissions","role_permissions","user_roles","role_settings",
  "strategic_plans","strategic_statements","strategic_goals","kpis","kpi_targets","kpi_measurements","evidences","evaluations","findings","recommendations","followups","followup_verifications","approvals","publication_policies","publications","audit_logs",
  "news_categories","news_articles","governance_scopes","curricula","graduate_profiles","cpl","courses","curriculum_courses","cpmk","cpmk_cpl_mappings","curriculum_review_cycles","obe_imports",
  "laboratories","laboratory_profiles","laboratory_programs","laboratory_equipment","laboratory_usage","laboratory_maintenance","laboratory_k3l_checks","personnel","research_projects","community_service_projects","student_annual_stats","graduate_outcome_stats","cooperations","laboratory_profile_programs",
  "accreditation_agencies","accreditation_frameworks","accreditation_clusters","accreditation_criteria","accreditation_indicators","accreditation_indicator_variables","accreditation_scoring_rubrics","accreditation_indicator_clusters","accreditation_evidence_requirements","study_program_accreditation_frameworks","accreditation_assessments","accreditation_assessment_values","accreditation_assessment_sources"
] as const;

function safeIdentifier(value:string){if(!/^[a-zA-Z][a-zA-Z0-9_]{2,63}$/.test(value))throw new Error("Nama database hanya boleh berisi huruf, angka, dan underscore (3-64 karakter).");return value;}

type TenantSeed={code:string;name:string;organizationType:string;programs:Array<{code:string;name:string;level?:string;frameworkCode?:string}>;adminName:string;adminEmail:string;adminPassword:string};

export async function provisionTenantDatabase(databaseName:string,seed:TenantSeed){
  const adminUrl=process.env.MASTER_DATABASE_ADMIN_URL;
  const sourceUrl=process.env.DATABASE_URL;
  if(!adminUrl||!sourceUrl)return {status:"AWAITING_DATABASE",message:"MASTER_DATABASE_ADMIN_URL belum dikonfigurasi. Spesifikasi tenant sudah disimpan tetapi database belum dibuat."};
  const target=safeIdentifier(databaseName),source=new URL(sourceUrl).pathname.replace(/^\//,"");
  safeIdentifier(source);
  const connection=await mysql.createConnection(adminUrl);
  try{
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${target}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    const[existing]=await connection.query<mysql.RowDataPacket[]>("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=?",[source]);
    const available=new Set(existing.map(row=>String(row.TABLE_NAME)));
    await connection.query("SET FOREIGN_KEY_CHECKS=0");
    for(const table of tenantTables)if(available.has(table))await connection.query(`CREATE TABLE IF NOT EXISTS \`${target}\`.\`${table}\` LIKE \`${source}\`.\`${table}\``);
    for(const table of ["roles","permissions","role_permissions","role_settings","publication_policies","accreditation_agencies","accreditation_frameworks","accreditation_clusters","accreditation_criteria","accreditation_indicators","accreditation_indicator_variables","accreditation_scoring_rubrics","accreditation_indicator_clusters","accreditation_evidence_requirements"] as const)if(available.has(table))await connection.query(`INSERT IGNORE INTO \`${target}\`.\`${table}\` SELECT * FROM \`${source}\`.\`${table}\``);
    const[organizations]=await connection.execute<mysql.ResultSetHeader>(`INSERT INTO \`${target}\`.organizations (organization_type,code,name,status,created_at) VALUES (?,?,?,?,NOW())`,[seed.organizationType,seed.code,seed.name,"ACTIVE"]);
    for(const program of seed.programs){const[created]=await connection.execute<mysql.ResultSetHeader>(`INSERT INTO \`${target}\`.study_programs (organization_id,code,name,level,status) VALUES (?,?,?,?,?)`,[organizations.insertId,program.code,program.name,program.level??null,"ACTIVE"]);if(program.frameworkCode)await connection.execute(`INSERT INTO \`${target}\`.study_program_accreditation_frameworks (study_program_id,framework_id,is_primary,assignment_status,created_at,updated_at) SELECT ?,id,TRUE,'ACTIVE',NOW(),NOW() FROM \`${target}\`.accreditation_frameworks WHERE code=? AND lifecycle_status='ACTIVE' ORDER BY version_number DESC LIMIT 1`,[created.insertId,program.frameworkCode]);}
    const passwordHash=await bcrypt.hash(seed.adminPassword,12);
    const[user]=await connection.execute<mysql.ResultSetHeader>(`INSERT INTO \`${target}\`.users (name,email,password_hash,status,created_at) VALUES (?,?,?,?,NOW())`,[seed.adminName,seed.adminEmail.toLowerCase(),passwordHash,"ACTIVE"]);
    await connection.execute(`INSERT INTO \`${target}\`.user_roles (user_id,role_id,organization_id,study_program_id) SELECT ?,id,?,NULL FROM \`${target}\`.roles WHERE code='ADMIN_DATA'`,[user.insertId,organizations.insertId]);
    await connection.query("SET FOREIGN_KEY_CHECKS=1");
    return {status:"DATABASE_READY",message:`Database ${target} dan admin awal berhasil dibuat.`,tables:tenantTables.filter(table=>available.has(table)).length};
  }finally{await connection.end();}
}
