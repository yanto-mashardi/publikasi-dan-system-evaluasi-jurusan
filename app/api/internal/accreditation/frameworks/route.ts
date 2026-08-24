import { and,eq,inArray } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { accreditationAgencies,accreditationAssessments,accreditationClusters,accreditationCriteria,accreditationEvidenceRequirements,accreditationFrameworks,accreditationIndicatorClusters,accreditationIndicatorMandates,accreditationIndicators,accreditationIndicatorVariables,accreditationScoringRubrics,studyProgramAccreditationFrameworks } from "@/src/db/schema-accreditation";
import { accreditationIndicatorModuleSources } from "@/src/db/schema-evaluation-modules";
import { tenantTemplateDistributions } from "@/src/db/schema-master";
import { getSession } from "@/src/lib/auth";
import { audit } from "@/src/lib/audit";
import { can } from "@/src/lib/rbac";

const createInput=z.object({agencyId:z.number().int().positive(),code:z.string().min(2).max(120),name:z.string().min(2).max(500),instrumentYear:z.number().int().min(2000).max(2200).optional(),instrumentType:z.string().max(120).optional(),educationLevel:z.string().max(80).optional(),modality:z.string().max(80).optional(),regulationReference:z.string().max(500).optional(),sourceUrl:z.string().url().optional(),versionNumber:z.number().int().positive().default(1),notes:z.string().optional()});
const patchInput=z.object({name:z.string().min(2).max(500).optional(),instrumentYear:z.number().int().min(2000).max(2200).nullable().optional(),instrumentType:z.string().max(120).nullable().optional(),educationLevel:z.string().max(80).nullable().optional(),modality:z.string().max(80).nullable().optional(),regulationReference:z.string().max(500).nullable().optional(),sourceUrl:z.string().url().nullable().optional(),lifecycleStatus:z.enum(["DRAFT","ACTIVE","ARCHIVED"]).optional(),effectiveFrom:z.string().nullable().optional(),effectiveTo:z.string().nullable().optional(),notes:z.string().nullable().optional()});
function idFrom(req:Request){const id=Number(new URL(req.url).searchParams.get("id"));return Number.isInteger(id)&&id>0?id:null;}

export async function GET(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"accreditation.read"))return NextResponse.json({error:"Forbidden"},{status:403});const agencyId=Number(new URL(req.url).searchParams.get("agencyId"));const db=requireDb();const base=db.select({id:accreditationFrameworks.id,agencyId:accreditationFrameworks.agencyId,agencyCode:accreditationAgencies.code,agencyName:accreditationAgencies.name,code:accreditationFrameworks.code,name:accreditationFrameworks.name,instrumentYear:accreditationFrameworks.instrumentYear,instrumentType:accreditationFrameworks.instrumentType,educationLevel:accreditationFrameworks.educationLevel,modality:accreditationFrameworks.modality,regulationReference:accreditationFrameworks.regulationReference,sourceUrl:accreditationFrameworks.sourceUrl,versionNumber:accreditationFrameworks.versionNumber,lifecycleStatus:accreditationFrameworks.lifecycleStatus,effectiveFrom:accreditationFrameworks.effectiveFrom,effectiveTo:accreditationFrameworks.effectiveTo,notes:accreditationFrameworks.notes}).from(accreditationFrameworks).innerJoin(accreditationAgencies,eq(accreditationFrameworks.agencyId,accreditationAgencies.id));return NextResponse.json(Number.isInteger(agencyId)&&agencyId>0?await base.where(eq(accreditationFrameworks.agencyId,agencyId)):await base);}

export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"accreditation.framework.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const p=createInput.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const[agency]=await db.select({id:accreditationAgencies.id}).from(accreditationAgencies).where(and(eq(accreditationAgencies.id,p.data.agencyId),eq(accreditationAgencies.status,"ACTIVE"))).limit(1);if(!agency)return NextResponse.json({error:"Lembaga akreditasi tidak aktif/tidak ditemukan."},{status:404});const code=p.data.code.trim().toUpperCase();const[found]=await db.select({id:accreditationFrameworks.id}).from(accreditationFrameworks).where(and(eq(accreditationFrameworks.agencyId,p.data.agencyId),eq(accreditationFrameworks.code,code),eq(accreditationFrameworks.versionNumber,p.data.versionNumber))).limit(1);if(found)return NextResponse.json({error:"Framework dengan kode dan versi tersebut sudah ada."},{status:409});const x=await db.insert(accreditationFrameworks).values({...p.data,code,modality:p.data.modality??"TATAP_MUKA",lifecycleStatus:"DRAFT"});const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"CREATE_ACCREDITATION_FRAMEWORK",subjectType:"ACCREDITATION_FRAMEWORK",subjectId:id,after:{...p.data,code}});return NextResponse.json({id,code,lifecycleStatus:"DRAFT"},{status:201});}

export async function PATCH(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"accreditation.framework.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const id=idFrom(req);if(!id)return NextResponse.json({error:"Invalid id"},{status:400});const p=patchInput.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const[before]=await db.select().from(accreditationFrameworks).where(eq(accreditationFrameworks.id,id)).limit(1);if(!before)return NextResponse.json({error:"Framework tidak ditemukan."},{status:404});if(before.lifecycleStatus==="ARCHIVED")return NextResponse.json({error:"Framework ARCHIVED bersifat read-only. Buat versi baru bila diperlukan."},{status:409});if(before.lifecycleStatus==="ACTIVE"){
  if(p.data.lifecycleStatus&&p.data.lifecycleStatus!=="ARCHIVED")return NextResponse.json({error:"Framework ACTIVE hanya dapat diarsipkan, bukan dikembalikan ke DRAFT."},{status:409});
  if(Object.keys(p.data).some(k=>!["lifecycleStatus","effectiveTo","notes"].includes(k)))return NextResponse.json({error:"Framework ACTIVE tidak boleh diubah in-place. Buat versi baru."},{status:409});
}
if(before.lifecycleStatus==="DRAFT"&&p.data.lifecycleStatus==="ACTIVE"){
  const[cluster]=await db.select({id:accreditationClusters.id}).from(accreditationClusters).where(and(eq(accreditationClusters.frameworkId,id),eq(accreditationClusters.status,"ACTIVE"))).limit(1);
  const[criterion]=await db.select({id:accreditationCriteria.id}).from(accreditationCriteria).where(and(eq(accreditationCriteria.frameworkId,id),eq(accreditationCriteria.status,"ACTIVE"))).limit(1);
  if(!cluster||!criterion)return NextResponse.json({error:"Framework harus memiliki minimal satu klaster dan satu kriteria aktif sebelum diaktifkan."},{status:409});
}
const changes={...p.data};if(p.data.lifecycleStatus==="ACTIVE"&&!p.data.effectiveFrom)changes.effectiveFrom=new Date().toISOString().slice(0,10);if(p.data.lifecycleStatus==="ARCHIVED"&&!p.data.effectiveTo)changes.effectiveTo=new Date().toISOString().slice(0,10);await db.update(accreditationFrameworks).set({...changes,updatedAt:new Date()}).where(eq(accreditationFrameworks.id,id));await audit({actorId:s.userId,action:"UPDATE_ACCREDITATION_FRAMEWORK",subjectType:"ACCREDITATION_FRAMEWORK",subjectId:id,before,after:changes});return NextResponse.json({id,...changes});}

export async function DELETE(req:Request){
 const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});
 if(!can(s,"accreditation.framework.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
 const id=idFrom(req);if(!id)return NextResponse.json({error:"Invalid id"},{status:400});
 const db=requireDb();
 const[before]=await db.select().from(accreditationFrameworks).where(eq(accreditationFrameworks.id,id)).limit(1);
 if(!before)return NextResponse.json({error:"Framework tidak ditemukan."},{status:404});
 if(before.lifecycleStatus==="ACTIVE")return NextResponse.json({error:"Framework ACTIVE harus diarsipkan terlebih dahulu sebelum dihapus permanen."},{status:409});
 const[assignment]=await db.select({id:studyProgramAccreditationFrameworks.id}).from(studyProgramAccreditationFrameworks).where(eq(studyProgramAccreditationFrameworks.frameworkId,id)).limit(1);
 const[distribution]=await db.select({id:tenantTemplateDistributions.id}).from(tenantTemplateDistributions).where(eq(tenantTemplateDistributions.frameworkCode,before.code)).limit(1);
 if(assignment||distribution)return NextResponse.json({error:"Framework masih memiliki penugasan Prodi atau riwayat distribusi Tenant. Lepaskan relasi tersebut sebelum menghapus permanen."},{status:409});
 const indicatorRows=await db.select({id:accreditationIndicators.id}).from(accreditationIndicators).where(eq(accreditationIndicators.frameworkId,id));
 const indicatorIds=indicatorRows.map(row=>row.id);
 const[assessment]=indicatorIds.length?await db.select({id:accreditationAssessments.id}).from(accreditationAssessments).where(inArray(accreditationAssessments.indicatorId,indicatorIds)).limit(1):[];
 const[mandate]=indicatorIds.length?await db.select({id:accreditationIndicatorMandates.id}).from(accreditationIndicatorMandates).where(inArray(accreditationIndicatorMandates.indicatorId,indicatorIds)).limit(1):[];
 if(assessment||mandate)return NextResponse.json({error:"Framework masih memiliki mandat atau hasil assessment dan tidak dapat dihapus permanen."},{status:409});
 await db.transaction(async tx=>{
  if(indicatorIds.length){
   await tx.delete(accreditationIndicatorClusters).where(inArray(accreditationIndicatorClusters.indicatorId,indicatorIds));
   await tx.delete(accreditationEvidenceRequirements).where(inArray(accreditationEvidenceRequirements.indicatorId,indicatorIds));
   await tx.delete(accreditationScoringRubrics).where(inArray(accreditationScoringRubrics.indicatorId,indicatorIds));
   await tx.delete(accreditationIndicatorVariables).where(inArray(accreditationIndicatorVariables.indicatorId,indicatorIds));
  }
  await tx.delete(accreditationIndicatorModuleSources).where(eq(accreditationIndicatorModuleSources.frameworkId,id));
  await tx.delete(accreditationIndicators).where(eq(accreditationIndicators.frameworkId,id));
  await tx.delete(accreditationCriteria).where(eq(accreditationCriteria.frameworkId,id));
  await tx.delete(accreditationClusters).where(eq(accreditationClusters.frameworkId,id));
  await tx.delete(accreditationFrameworks).where(eq(accreditationFrameworks.id,id));
 });
 await audit({actorId:s.userId,action:"DELETE_ACCREDITATION_FRAMEWORK_PERMANENT",subjectType:"ACCREDITATION_FRAMEWORK",subjectId:id,before,after:null});
 return NextResponse.json({id,deleted:true});
}
