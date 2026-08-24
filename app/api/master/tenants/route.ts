import { and,eq,inArray,or } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { tenantApplications,tenantProvisioningJobs,tenantTemplateDistributions } from "@/src/db/schema-master";
import { federatedApplications } from "@/src/db/schema-admin";
import { getSession } from "@/src/lib/auth";
import { isMasterApplication } from "@/src/lib/application-mode";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";
import { deleteTenantDatabase,getTenantDatabaseDetails,provisionTenantDatabase,resetTenantAdminPassword } from "@/src/services/tenant-provisioning";
import { randomBytes } from "node:crypto";
import { encryptFederationToken } from "@/src/services/federation-security";
import { accreditationFrameworks } from "@/src/db/schema-accreditation";
import { assertLocalTenantTargetAvailable,createLocalTenantInstance,deleteLocalTenantInstance } from "@/src/services/local-tenant-instance";

const input=z.object({code:z.string().min(2).max(80).regex(/^[A-Za-z][A-Za-z0-9_-]+$/),name:z.string().min(3).max(255),domain:z.string().url(),databaseName:z.string().regex(/^[A-Za-z][A-Za-z0-9_]{2,63}$/),organizationType:z.enum(["UPPS","JURUSAN","FAKULTAS"]).default("UPPS"),deploymentTarget:z.enum(["LOCAL","VPS"]).default("LOCAL"),programs:z.array(z.object({code:z.string().min(2).max(50),name:z.string().min(3).max(255),level:z.string().max(50).optional(),frameworkCode:z.string().min(2).max(120)})).min(1),adminName:z.string().min(3).max(255),adminEmail:z.string().email(),adminPassword:z.string().min(10).max(128)});
async function guard(){const session=await getSession();if(!session)return {response:NextResponse.json({error:"Unauthorized"},{status:401})};if(!isMasterApplication())return {response:NextResponse.json({error:"Endpoint provisioning hanya aktif pada APP_MODE=MASTER."},{status:409})};if(!can(session,"system.configure"))return {response:NextResponse.json({error:"Forbidden"},{status:403})};return {session};}

export async function GET(req:Request){const auth=await guard();if(auth.response)return auth.response;const db=requireDb(),id=Number(new URL(req.url).searchParams.get("id"));if(Number.isSafeInteger(id)&&id>0){const[tenant]=await db.select().from(tenantApplications).where(eq(tenantApplications.id,id)).limit(1);if(!tenant)return NextResponse.json({error:"Aplikasi Jurusan tidak ditemukan."},{status:404});try{const databaseDetails=await getTenantDatabaseDetails(tenant.databaseName);const{encryptedFederationToken,...safeTenant}=tenant;return NextResponse.json({...safeTenant,federationConfigured:Boolean(encryptedFederationToken),databaseDetails});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Detail database Jurusan tidak dapat dibaca."},{status:409});}}const rows=await db.select().from(tenantApplications);return NextResponse.json(rows.map(({encryptedFederationToken,...row})=>({...row,federationConfigured:Boolean(encryptedFederationToken)})));}

export async function POST(req:Request){
  const auth=await guard();if(auth.response)return auth.response;
  const parsed=input.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
  const data={...parsed.data,code:parsed.data.code.toUpperCase(),domain:parsed.data.domain.replace(/\/$/,"")};const db=requireDb(),federationToken=randomBytes(32).toString("base64url");
  if(data.deploymentTarget==="LOCAL")try{await assertLocalTenantTargetAvailable(data.name,data.code);}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Folder Tenant lokal tidak dapat dibuat."},{status:409});}
  const requestedFrameworks=[...new Set(data.programs.map(program=>program.frameworkCode))];const activeFrameworks=await db.select({code:accreditationFrameworks.code}).from(accreditationFrameworks).where(and(inArray(accreditationFrameworks.code,requestedFrameworks),eq(accreditationFrameworks.lifecycleStatus,"ACTIVE")));const available=new Set(activeFrameworks.map(row=>row.code)),missing=requestedFrameworks.filter(code=>!available.has(code));if(missing.length)return NextResponse.json({error:`Framework belum tersedia atau belum ACTIVE: ${missing.join(", ")}. Selesaikan menu 1. Template LAM terlebih dahulu.`},{status:409});
  const[[duplicate],[federationDuplicate]]=await Promise.all([db.select({id:tenantApplications.id}).from(tenantApplications).where(or(eq(tenantApplications.code,data.code),eq(tenantApplications.domain,data.domain),eq(tenantApplications.databaseName,data.databaseName))).limit(1),db.select({id:federatedApplications.id}).from(federatedApplications).where(or(eq(federatedApplications.code,data.code),eq(federatedApplications.baseUrl,data.domain))).limit(1)]);if(duplicate||federationDuplicate)return NextResponse.json({error:"Kode, domain, atau nama database sudah digunakan Tenant/federasi lain."},{status:409});
  const result=await db.insert(tenantApplications).values({code:data.code,name:data.name,domain:data.domain,databaseName:data.databaseName,organizationType:data.organizationType,deploymentStatus:"PROVISIONING",encryptedFederationToken:encryptFederationToken(federationToken),configuration:{programs:data.programs,adminEmail:data.adminEmail,deploymentTarget:data.deploymentTarget}});
  const tenantId=Number(result[0].insertId);const job=await db.insert(tenantProvisioningJobs).values({tenantId,action:"CREATE_TENANT",status:"RUNNING",requestedBy:auth.session!.userId,startedAt:new Date(),requestSnapshot:{code:data.code,name:data.name,domain:data.domain,databaseName:data.databaseName,deploymentTarget:data.deploymentTarget,programs:data.programs,adminEmail:data.adminEmail}});const jobId=Number(job[0].insertId);
  await db.insert(federatedApplications).values({code:data.code,name:data.name,baseUrl:data.domain,organizationCode:data.code,encryptedAccessToken:encryptFederationToken(federationToken),status:"ACTIVE",connectionStatus:"NOT_CHECKED"});
  try{
    const provision=await provisionTenantDatabase(data.databaseName,data);
    const localInstance=data.deploymentTarget==="LOCAL"&&provision.status==="DATABASE_READY"?await createLocalTenantInstance({name:data.name,code:data.code,databaseName:data.databaseName,federationToken}):null;
    const deploymentStatus=localInstance?.status??provision.status;
    await db.update(tenantApplications).set({deploymentStatus,updatedAt:new Date()}).where(eq(tenantApplications.id,tenantId));
    await db.update(tenantProvisioningJobs).set({status:provision.status==="DATABASE_READY"?"COMPLETED":"WAITING",resultSnapshot:{...provision,deploymentTarget:data.deploymentTarget,localInstance},finishedAt:new Date()}).where(eq(tenantProvisioningJobs.id,jobId));
    for(const program of data.programs)if(program.frameworkCode)await db.insert(tenantTemplateDistributions).values({tenantId,studyProgramCode:program.code,agencyCode:"FROM_FRAMEWORK",frameworkCode:program.frameworkCode,frameworkVersion:"LATEST_ACTIVE",distributionStatus:provision.status==="DATABASE_READY"?"DISTRIBUTED":"PENDING",distributedAt:provision.status==="DATABASE_READY"?new Date():null});
    await audit({actorId:auth.session!.userId,action:"PROVISION_TENANT",subjectType:"TENANT_APPLICATION",subjectId:tenantId,after:{...data,adminPassword:"[REDACTED]",provision}});
    return NextResponse.json({tenantId,jobId,status:deploymentStatus,message:localInstance?`Database dan folder aplikasi Tenant berhasil dibuat di ${localInstance.folderPath}.`:`Database berhasil dibuat. Deployment VPS masih perlu dilakukan pada domain ${data.domain}.`,deployment:{target:data.deploymentTarget,domain:data.domain,appMode:"TENANT",databaseName:data.databaseName,localFolder:localInstance?.folderPath??null,environmentFile:localInstance?.environmentFile??null,federationEndpoint:`${data.domain}/api/federation/summary`,federationToken,requiredEnvironment:{APP_MODE:"TENANT",DATABASE_URL:"[URL database Tenant]",AUTH_SECRET:"[rahasia unik minimal 32 karakter]",FEDERATION_EXPORT_TOKEN:federationToken}}},{status:201});
  }catch(error){const message=error instanceof Error?error.message:"Provisioning gagal.";await db.update(tenantApplications).set({deploymentStatus:"FAILED",lastError:message,updatedAt:new Date()}).where(eq(tenantApplications.id,tenantId));await db.update(tenantProvisioningJobs).set({status:"FAILED",errorMessage:message,finishedAt:new Date()}).where(eq(tenantProvisioningJobs.id,jobId));return NextResponse.json({error:message,tenantId,jobId},{status:500});}
}

export async function DELETE(req:Request){
  const auth=await guard();if(auth.response)return auth.response;
  const id=Number(new URL(req.url).searchParams.get("id"));if(!Number.isSafeInteger(id)||id<1)return NextResponse.json({error:"ID aplikasi tidak valid."},{status:400});
  const parsed=z.object({confirmationCode:z.string().min(2).max(80)}).safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Ketik kode Jurusan untuk mengonfirmasi penghapusan permanen."},{status:400});
  const db=requireDb();const[tenant]=await db.select().from(tenantApplications).where(eq(tenantApplications.id,id)).limit(1);if(!tenant)return NextResponse.json({error:"Aplikasi Jurusan tidak ditemukan."},{status:404});
  if(parsed.data.confirmationCode.trim().toUpperCase()!==tenant.code.toUpperCase())return NextResponse.json({error:`Konfirmasi salah. Ketik kode ${tenant.code} dengan tepat.`},{status:409});
  const configuration=(tenant.configuration??{}) as {deploymentTarget?:string};
  let folder:{folderPath:string;folderDeleted:boolean}|null=null;
  if(configuration.deploymentTarget==="LOCAL"||tenant.deploymentStatus==="TENANT_LOCAL_READY")try{folder=await deleteLocalTenantInstance({name:tenant.name,code:tenant.code,databaseName:tenant.databaseName});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Folder Tenant lokal tidak dapat diverifikasi."},{status:409});}
  const database=await deleteTenantDatabase(tenant.databaseName);
  await db.transaction(async tx=>{
    await tx.delete(tenantTemplateDistributions).where(eq(tenantTemplateDistributions.tenantId,id));
    await tx.delete(tenantProvisioningJobs).where(eq(tenantProvisioningJobs.tenantId,id));
    await tx.delete(federatedApplications).where(or(eq(federatedApplications.code,tenant.code),eq(federatedApplications.baseUrl,tenant.domain)));
    await tx.delete(tenantApplications).where(eq(tenantApplications.id,id));
  });
  await audit({actorId:auth.session!.userId,action:"DELETE_TENANT_PERMANENT",subjectType:"TENANT_APPLICATION",subjectId:id,before:{id:tenant.id,code:tenant.code,name:tenant.name,domain:tenant.domain,databaseName:tenant.databaseName},after:{databaseDeleted:database.databaseDeleted,folderDeleted:folder?.folderDeleted??false}});
  return NextResponse.json({deleted:true,message:`Aplikasi ${tenant.name} dan database ${tenant.databaseName} telah dihapus permanen.`,database,folder});
}

export async function PATCH(req:Request){
  const auth=await guard();if(auth.response)return auth.response;
  const parsed=z.object({id:z.number().int().positive(),action:z.literal("RESET_ADMIN_PASSWORD"),email:z.string().email(),newPassword:z.string().min(10).max(128)}).safeParse(await req.json().catch(()=>null));if(!parsed.success)return NextResponse.json({error:"Email dan password baru minimal 10 karakter wajib diisi."},{status:400});
  const db=requireDb();const[tenant]=await db.select().from(tenantApplications).where(eq(tenantApplications.id,parsed.data.id)).limit(1);if(!tenant)return NextResponse.json({error:"Aplikasi Jurusan tidak ditemukan."},{status:404});
  const configuration=(tenant.configuration??{}) as {adminEmail?:string};
  try{const result=await resetTenantAdminPassword(tenant.databaseName,parsed.data.email,parsed.data.newPassword,configuration.adminEmail);await audit({actorId:auth.session!.userId,action:"RESET_TENANT_ADMIN_PASSWORD",subjectType:"TENANT_APPLICATION",subjectId:tenant.id,after:{email:result.email,password:"[REDACTED]"}});return NextResponse.json({message:`Password ${result.email} berhasil diatur ulang dan akun dipastikan aktif.`});}catch(error){return NextResponse.json({error:error instanceof Error?error.message:"Password tidak dapat diatur ulang."},{status:409});}
}
