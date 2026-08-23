import { and,eq } from "drizzle-orm";
import { requireDb } from "@/src/db";
import { studyPrograms } from "@/src/db/schema";
import { laboratories,laboratoryEquipment,laboratoryPrograms } from "@/src/db/schema-phase6";
import type { SessionUser } from "@/src/lib/auth";
import { can,scopeAllows } from "@/src/lib/rbac";
import { governanceWriteAllows } from "@/src/services/governance-scope";

export function canReadResources(user:SessionUser){return can(user,"resources.read")||can(user,"resources.manage")||can(user,"resources.contribute")||can(user,"system.configure");}

export function canWriteResourceScope(user:SessionUser,organizationId:number,studyProgramId?:number|null,manageOnly=false){
  if(manageOnly&&!can(user,"resources.manage")&&!can(user,"system.configure"))return false;
  if(!manageOnly&&!(can(user,"resources.manage")||can(user,"resources.contribute")||can(user,"system.configure")))return false;
  if(studyProgramId==null&&!can(user,"resources.manage")&&!can(user,"system.configure"))return false;
  return governanceWriteAllows(user,organizationId,studyProgramId??null);
}

export function canReadResourceScope(user:SessionUser,organizationId:number,studyProgramId?:number|null){return canReadResources(user)&&scopeAllows(user,organizationId,studyProgramId??null);}

export async function getProgramScope(studyProgramId:number){const db=requireDb();const[program]=await db.select({id:studyPrograms.id,organizationId:studyPrograms.organizationId,status:studyPrograms.status}).from(studyPrograms).where(eq(studyPrograms.id,studyProgramId)).limit(1);return program??null;}

export async function getLaboratoryScope(laboratoryId:number){const db=requireDb();const[lab]=await db.select({id:laboratories.id,organizationId:laboratories.organizationId,status:laboratories.status}).from(laboratories).where(eq(laboratories.id,laboratoryId)).limit(1);return lab??null;}

export async function getEquipmentScope(equipmentId:number){const db=requireDb();const[equipment]=await db.select({id:laboratoryEquipment.id,laboratoryId:laboratoryEquipment.laboratoryId}).from(laboratoryEquipment).where(eq(laboratoryEquipment.id,equipmentId)).limit(1);if(!equipment)return null;const lab=await getLaboratoryScope(equipment.laboratoryId);return lab?{...lab,laboratoryId:equipment.laboratoryId}:null;}

export async function laboratoryServesProgram(laboratoryId:number,studyProgramId:number){const db=requireDb();const[row]=await db.select().from(laboratoryPrograms).where(and(eq(laboratoryPrograms.laboratoryId,laboratoryId),eq(laboratoryPrograms.studyProgramId,studyProgramId))).limit(1);return !!row;}

export async function validateProgramUnderOrganization(studyProgramId:number,organizationId:number){const program=await getProgramScope(studyProgramId);return !!program&&program.status==="ACTIVE"&&program.organizationId===organizationId;}
