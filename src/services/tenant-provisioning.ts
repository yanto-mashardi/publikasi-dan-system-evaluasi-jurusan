import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";
import {PERMISSIONS,ROLE_GRANTS,ROLE_NAMES} from "@/src/config/access-baseline";

const tenantTables=[
  "organizations","study_programs","users","roles","permissions","role_permissions","user_roles","role_settings",
  "strategic_plans","strategic_statements","strategic_goals","kpis","kpi_targets","kpi_measurements","evidences","evaluations","findings","recommendations","followups","followup_verifications","approvals","publication_policies","publications","audit_logs",
  "news_categories","news_articles","governance_scopes","curricula","graduate_profiles","cpl","courses","curriculum_courses","cpmk","cpmk_cpl_mappings","curriculum_review_cycles","obe_imports",
  "laboratories","laboratory_profiles","laboratory_programs","laboratory_equipment","laboratory_usage","laboratory_maintenance","laboratory_k3l_checks","personnel","research_projects","community_service_projects","student_annual_stats","graduate_outcome_stats","cooperations","laboratory_profile_programs",
  "accreditation_agencies","accreditation_frameworks","accreditation_clusters","accreditation_criteria","accreditation_indicators","accreditation_indicator_variables","accreditation_scoring_rubrics","accreditation_indicator_clusters","accreditation_evidence_requirements","study_program_accreditation_frameworks","accreditation_indicator_mandates","accreditation_assessments","accreditation_assessment_sources","evaluation_modules","evaluation_periods","evaluation_module_snapshots","accreditation_indicator_module_sources"
] as const;

function safeIdentifier(value:string){if(!/^[a-zA-Z][a-zA-Z0-9_]{2,63}$/.test(value))throw new Error("Nama database hanya boleh berisi huruf, angka, dan underscore (3-64 karakter).");return value;}

type TenantSeed={code:string;name:string;organizationType:string;programs:Array<{code:string;name:string;level?:string;frameworkCode?:string}>;adminName:string;adminEmail:string;adminPassword:string};

async function ensureTenantAccessBaseline(connection:mysql.Connection,target:string){
  for(const code of PERMISSIONS)await connection.execute(`INSERT INTO \`${target}\`.permissions (code,name) VALUES (?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)`,[code,code]);
  for(const[code,name]of Object.entries(ROLE_NAMES)){
    await connection.execute(`INSERT INTO \`${target}\`.roles (code,name) VALUES (?,?) ON DUPLICATE KEY UPDATE name=VALUES(name)`,[code,name]);
    await connection.execute(`INSERT INTO \`${target}\`.role_settings (role_id,status,is_system_role,updated_at) SELECT id,'ACTIVE',TRUE,NOW() FROM \`${target}\`.roles WHERE code=? ON DUPLICATE KEY UPDATE status='ACTIVE',is_system_role=TRUE,updated_at=NOW()`,[code]);
    await connection.execute(`DELETE rp FROM \`${target}\`.role_permissions rp INNER JOIN \`${target}\`.roles r ON r.id=rp.role_id WHERE r.code=?`,[code]);
    for(const permissionCode of ROLE_GRANTS[code]??[])await connection.execute(`INSERT IGNORE INTO \`${target}\`.role_permissions (role_id,permission_id) SELECT r.id,p.id FROM \`${target}\`.roles r CROSS JOIN \`${target}\`.permissions p WHERE r.code=? AND p.code=?`,[code,permissionCode]);
  }
}

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
    for(const table of ["roles","permissions","role_permissions","role_settings","publication_policies","accreditation_agencies","accreditation_frameworks","accreditation_clusters","accreditation_criteria","accreditation_indicators","accreditation_indicator_variables","accreditation_scoring_rubrics","accreditation_indicator_clusters","accreditation_evidence_requirements","evaluation_modules"] as const)if(available.has(table))await connection.query(`INSERT IGNORE INTO \`${target}\`.\`${table}\` SELECT * FROM \`${source}\`.\`${table}\``);
    await ensureTenantAccessBaseline(connection,target);
    const[organizations]=await connection.execute<mysql.ResultSetHeader>(`INSERT INTO \`${target}\`.organizations (organization_type,code,name,status,created_at) VALUES (?,?,?,?,NOW())`,[seed.organizationType,seed.code,seed.name,"ACTIVE"]);
    for(const program of seed.programs){const[created]=await connection.execute<mysql.ResultSetHeader>(`INSERT INTO \`${target}\`.study_programs (organization_id,code,name,level,status) VALUES (?,?,?,?,?)`,[organizations.insertId,program.code,program.name,program.level??null,"ACTIVE"]);if(program.frameworkCode)await connection.execute(`INSERT INTO \`${target}\`.study_program_accreditation_frameworks (study_program_id,framework_id,is_primary,assignment_status,created_at,updated_at) SELECT ?,id,TRUE,'ACTIVE',NOW(),NOW() FROM \`${target}\`.accreditation_frameworks WHERE code=? AND lifecycle_status='ACTIVE' ORDER BY version_number DESC LIMIT 1`,[created.insertId,program.frameworkCode]);}
    const passwordHash=await bcrypt.hash(seed.adminPassword,12);
    const[user]=await connection.execute<mysql.ResultSetHeader>(`INSERT INTO \`${target}\`.users (name,email,password_hash,status,created_at) VALUES (?,?,?,?,NOW())`,[seed.adminName,seed.adminEmail.toLowerCase(),passwordHash,"ACTIVE"]);
    await connection.execute(`INSERT INTO \`${target}\`.user_roles (user_id,role_id,organization_id,study_program_id) SELECT ?,id,?,NULL FROM \`${target}\`.roles WHERE code='ADMIN_DATA'`,[user.insertId,organizations.insertId]);
    await connection.query("SET FOREIGN_KEY_CHECKS=1");
    return {status:"DATABASE_READY",message:`Database ${target} dan admin awal berhasil dibuat.`,tables:tenantTables.filter(table=>available.has(table)).length};
  }finally{await connection.end();}
}

export async function syncTenantDatabaseSchema(databaseName:string){
  const adminUrl=process.env.MASTER_DATABASE_ADMIN_URL;
  const sourceUrl=process.env.DATABASE_URL;
  if(!adminUrl||!sourceUrl)throw new Error("Koneksi admin database Master belum dikonfigurasi.");
  const target=safeIdentifier(databaseName),source=safeIdentifier(new URL(sourceUrl).pathname.replace(/^\//,""));
  if(target.toLowerCase()===source.toLowerCase())throw new Error("Database Tenant tidak boleh sama dengan database Master.");
  const connection=await mysql.createConnection(adminUrl);
  try{
    const[existing]=await connection.query<mysql.RowDataPacket[]>("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=?",[source]);
    const available=new Set(existing.map(row=>String(row.TABLE_NAME)));
    let createdTables=0;
    for(const table of tenantTables){
      if(!available.has(table))continue;
      const[found]=await connection.query<mysql.RowDataPacket[]>("SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA=? AND TABLE_NAME=?",[target,table]);
      if(!found.length){await connection.query(`CREATE TABLE \`${target}\`.\`${table}\` LIKE \`${source}\`.\`${table}\``);createdTables+=1;}
    }
    const[periodColumn]=await connection.query<mysql.RowDataPacket[]>("SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA=? AND TABLE_NAME='accreditation_indicator_mandates' AND COLUMN_NAME='period'",[target]);
    if(!periodColumn.length)await connection.query(`ALTER TABLE \`${target}\`.accreditation_indicator_mandates ADD COLUMN period varchar(50) NOT NULL DEFAULT 'LEGACY' AFTER indicator_id`);
    const[indexRows]=await connection.query<mysql.RowDataPacket[]>("SELECT COLUMN_NAME FROM information_schema.STATISTICS WHERE TABLE_SCHEMA=? AND TABLE_NAME='accreditation_indicator_mandates' AND INDEX_NAME='accreditation_indicator_mandate_uq' ORDER BY SEQ_IN_INDEX",[target]);
    const indexColumns=indexRows.map(row=>String(row.COLUMN_NAME));
    if(indexColumns.join(",")!=="assignment_id,indicator_id,period"){
      if(indexRows.length)await connection.query(`ALTER TABLE \`${target}\`.accreditation_indicator_mandates DROP INDEX accreditation_indicator_mandate_uq`);
      await connection.query(`ALTER TABLE \`${target}\`.accreditation_indicator_mandates ADD UNIQUE INDEX accreditation_indicator_mandate_uq (assignment_id,indicator_id,period)`);
    }
    return {databaseName:target,schemaSynchronized:true,createdTables};
  }finally{await connection.end();}
}

export async function deleteTenantDatabase(databaseName:string){
  const adminUrl=process.env.MASTER_DATABASE_ADMIN_URL;
  if(!adminUrl)throw new Error("MASTER_DATABASE_ADMIN_URL belum dikonfigurasi sehingga database Tenant tidak dapat dihapus dengan aman.");
  const target=safeIdentifier(databaseName);
  const masterDatabase=process.env.DATABASE_URL?new URL(process.env.DATABASE_URL).pathname.replace(/^\//,""):"";
  if(masterDatabase&&target.toLowerCase()===masterDatabase.toLowerCase())throw new Error("Database Tenant sama dengan database Master dan tidak boleh dihapus.");
  const connection=await mysql.createConnection(adminUrl);
  try{await connection.query(`DROP DATABASE IF EXISTS \`${target}\``);return {databaseName:target,databaseDeleted:true};}
  finally{await connection.end();}
}

export async function getTenantDatabaseDetails(databaseName:string){
  const adminUrl=process.env.MASTER_DATABASE_ADMIN_URL;
  if(!adminUrl)throw new Error("MASTER_DATABASE_ADMIN_URL belum dikonfigurasi.");
  const target=safeIdentifier(databaseName),connection=await mysql.createConnection(adminUrl);
  try{
    const[organizations]=await connection.query<mysql.RowDataPacket[]>(`SELECT id,organization_type AS organizationType,code,name,status FROM \`${target}\`.organizations ORDER BY id`);
    const[programs]=await connection.query<mysql.RowDataPacket[]>(`SELECT sp.id,sp.code,sp.name,sp.level,sp.status,af.code AS frameworkCode,af.name AS frameworkName,af.version_number AS frameworkVersion,aa.code AS agencyCode,aa.name AS agencyName FROM \`${target}\`.study_programs sp LEFT JOIN \`${target}\`.study_program_accreditation_frameworks assignment ON assignment.study_program_id=sp.id AND assignment.assignment_status='ACTIVE' LEFT JOIN \`${target}\`.accreditation_frameworks af ON af.id=assignment.framework_id LEFT JOIN \`${target}\`.accreditation_agencies aa ON aa.id=af.agency_id ORDER BY sp.id,assignment.is_primary DESC`);
    const[admins]=await connection.query<mysql.RowDataPacket[]>(`SELECT DISTINCT u.id,u.name,u.email,u.status,r.code AS roleCode,r.name AS roleName,ur.organization_id AS organizationId,ur.study_program_id AS studyProgramId FROM \`${target}\`.users u LEFT JOIN \`${target}\`.user_roles ur ON ur.user_id=u.id LEFT JOIN \`${target}\`.roles r ON r.id=ur.role_id ORDER BY u.id,r.code`);
    return {organizations,programs,admins};
  }finally{await connection.end();}
}

export async function resetTenantAdminPassword(databaseName:string,email:string,newPassword:string,expectedInitialAdminEmail?:string){
  const adminUrl=process.env.MASTER_DATABASE_ADMIN_URL;
  if(!adminUrl)throw new Error("MASTER_DATABASE_ADMIN_URL belum dikonfigurasi.");
  const target=safeIdentifier(databaseName),connection=await mysql.createConnection(adminUrl);
  try{
    await ensureTenantAccessBaseline(connection,target);
    const allowInitialAdmin=expectedInitialAdminEmail?.toLowerCase()===email.toLowerCase();
    const[users]=await connection.execute<mysql.RowDataPacket[]>(`SELECT DISTINCT u.id FROM \`${target}\`.users u LEFT JOIN \`${target}\`.user_roles ur ON ur.user_id=u.id LEFT JOIN \`${target}\`.roles r ON r.id=ur.role_id WHERE LOWER(u.email)=LOWER(?) AND (r.code IN ('ADMIN_DATA','KAPRODI','KAJUR','ADMIN_SYSTEM') OR ?=TRUE) LIMIT 1`,[email,allowInitialAdmin]);
    if(!users.length)throw new Error("Akun pengelola tersebut tidak ditemukan pada database Jurusan.");
    const passwordHash=await bcrypt.hash(newPassword,12);
    await connection.execute(`UPDATE \`${target}\`.users SET password_hash=?,status='ACTIVE' WHERE id=?`,[passwordHash,users[0].id]);
    if(allowInitialAdmin)await connection.execute(`INSERT INTO \`${target}\`.user_roles (user_id,role_id,organization_id,study_program_id) SELECT ?,r.id,o.id,NULL FROM \`${target}\`.roles r CROSS JOIN \`${target}\`.organizations o WHERE r.code='ADMIN_DATA' ORDER BY o.id LIMIT 1 ON DUPLICATE KEY UPDATE role_id=VALUES(role_id),organization_id=VALUES(organization_id)`,[users[0].id]);
    return {email:email.toLowerCase(),passwordReset:true};
  }finally{await connection.end();}
}
