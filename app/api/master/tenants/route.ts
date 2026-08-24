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
import { provisionTenantDatabase } from "@/src/services/tenant-provisioning";
import { randomBytes } from "node:crypto";
import { encryptFederationToken } from "@/src/services/federation-security";
import { accreditationFrameworks } from "@/src/db/schema-accreditation";

const input=z.object({code:z.string().min(2).max(80).regex(/^[A-Za-z][A-Za-z0-9_-]+$/),name:z.string().min(3).max(255),domain:z.string().url(),databaseName:z.string().regex(/^[A-Za-z][A-Za-z0-9_]{2,63}$/),organizationType:z.enum(["UPPS","JURUSAN","FAKULTAS"]).default("UPPS"),programs:z.array(z.object({code:z.string().min(2).max(50),name:z.string().min(3).max(255),level:z.string().max(50).optional(),frameworkCode:z.string().min(2).max(120)})).min(1),adminName:z.string().min(3).max(255),adminEmail:z.string().email(),adminPassword:z.string().min(10).max(128)});
async function guard(){const session=await getSession();if(!session)return {response:NextResponse.json({error:"Unauthorized"},{status:401})};if(!isMasterApplication())return {response:NextResponse.json({error:"Endpoint provisioning hanya aktif pada APP_MODE=MASTER."},{status:409})};if(!can(session,"system.configure"))return {response:NextResponse.json({error:"Forbidden"},{status:403})};return {session};}

export async function GET(){const auth=await guard();if(auth.response)return auth.response;const rows=await requireDb().select().from(tenantApplications);return NextResponse.json(rows.map(({encryptedFederationToken,...row})=>({...row,federationConfigured:Boolean(encryptedFederationToken)})));}

export async function POST(req:Request){
  const auth=await guard();if(auth.response)return auth.response;
  const parsed=input.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});
  const data={...parsed.data,code:parsed.data.code.toUpperCase(),domain:parsed.data.domain.replace(/\/$/,"")};const db=requireDb(),federationToken=randomBytes(32).toString("base64url");
  const requestedFrameworks=[...new Set(data.programs.map(program=>program.frameworkCode))];const activeFrameworks=await db.select({code:accreditationFrameworks.code}).from(accreditationFrameworks).where(and(inArray(accreditationFrameworks.code,requestedFrameworks),eq(accreditationFrameworks.lifecycleStatus,"ACTIVE")));const available=new Set(activeFrameworks.map(row=>row.code)),missing=requestedFrameworks.filter(code=>!available.has(code));if(missing.length)return NextResponse.json({error:`Framework belum tersedia atau belum ACTIVE: ${missing.join(", ")}. Selesaikan menu 1. Template LAM terlebih dahulu.`},{status:409});
  const[[duplicate],[federationDuplicate]]=await Promise.all([db.select({id:tenantApplications.id}).from(tenantApplications).where(or(eq(tenantApplications.code,data.code),eq(tenantApplications.domain,data.domain),eq(tenantApplications.databaseName,data.databaseName))).limit(1),db.select({id:federatedApplications.id}).from(federatedApplications).where(or(eq(federatedApplications.code,data.code),eq(federatedApplications.baseUrl,data.domain))).limit(1)]);if(duplicate||federationDuplicate)return NextResponse.json({error:"Kode, domain, atau nama database sudah digunakan Tenant/federasi lain."},{status:409});
  const result=await db.insert(tenantApplications).values({code:data.code,name:data.name,domain:data.domain,databaseName:data.databaseName,organizationType:data.organizationType,deploymentStatus:"PROVISIONING",encryptedFederationToken:encryptFederationToken(federationToken),configuration:{programs:data.programs,adminEmail:data.adminEmail}});
  const tenantId=Number(result[0].insertId);const job=await db.insert(tenantProvisioningJobs).values({tenantId,action:"CREATE_TENANT",status:"RUNNING",requestedBy:auth.session!.userId,startedAt:new Date(),requestSnapshot:{code:data.code,name:data.name,domain:data.domain,databaseName:data.databaseName,programs:data.programs,adminEmail:data.adminEmail}});const jobId=Number(job[0].insertId);
  await db.insert(federatedApplications).values({code:data.code,name:data.name,baseUrl:data.domain,organizationCode:data.code,encryptedAccessToken:encryptFederationToken(federationToken),status:"ACTIVE",connectionStatus:"NOT_CHECKED"});
  try{
    const provision=await provisionTenantDatabase(data.databaseName,data);
    await db.update(tenantApplications).set({deploymentStatus:provision.status,updatedAt:new Date()}).where(eq(tenantApplications.id,tenantId));
    await db.update(tenantProvisioningJobs).set({status:provision.status==="DATABASE_READY"?"COMPLETED":"WAITING",resultSnapshot:provision,finishedAt:new Date()}).where(eq(tenantProvisioningJobs.id,jobId));
    for(const program of data.programs)if(program.frameworkCode)await db.insert(tenantTemplateDistributions).values({tenantId,studyProgramCode:program.code,agencyCode:"FROM_FRAMEWORK",frameworkCode:program.frameworkCode,frameworkVersion:"LATEST_ACTIVE",distributionStatus:provision.status==="DATABASE_READY"?"DISTRIBUTED":"PENDING",distributedAt:provision.status==="DATABASE_READY"?new Date():null});
    await audit({actorId:auth.session!.userId,action:"PROVISION_TENANT",subjectType:"TENANT_APPLICATION",subjectId:tenantId,after:{...data,adminPassword:"[REDACTED]",provision}});
    return NextResponse.json({tenantId,jobId,...provision,deployment:{domain:data.domain,appMode:"TENANT",databaseName:data.databaseName,federationEndpoint:`${data.domain}/api/federation/summary`,federationToken,requiredEnvironment:{APP_MODE:"TENANT",DATABASE_URL:"[secret URL menuju database baru]",AUTH_SECRET:"[unik untuk Tenant]",FEDERATION_EXPORT_TOKEN:federationToken}}},{status:201});
  }catch(error){const message=error instanceof Error?error.message:"Provisioning gagal.";await db.update(tenantApplications).set({deploymentStatus:"FAILED",lastError:message,updatedAt:new Date()}).where(eq(tenantApplications.id,tenantId));await db.update(tenantProvisioningJobs).set({status:"FAILED",errorMessage:message,finishedAt:new Date()}).where(eq(tenantProvisioningJobs.id,jobId));return NextResponse.json({error:message,tenantId,jobId},{status:500});}
}
