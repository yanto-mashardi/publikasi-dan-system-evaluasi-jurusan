import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { curricula } from "@/src/db/schema-phase5";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";
import { canAccessProgram } from "@/src/services/academic-scope";

const input=z.object({studyProgramId:z.number().int().positive(),code:z.string().min(2).max(80),title:z.string().min(3).max(500),academicYearStart:z.number().int().optional(),academicYearEnd:z.number().int().optional(),totalCredits:z.number().nonnegative().optional(),description:z.string().optional()});
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});const db=requireDb();const rows=await db.select().from(curricula);const allowed=[];for(const row of rows)if(await canAccessProgram(s,row.studyProgramId))allowed.push(row);return NextResponse.json(allowed);}
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!(can(s,"curriculum.manage")||can(s,"data.create")))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});if(!(await canAccessProgram(s,p.data.studyProgramId)))return NextResponse.json({error:"Scope Program Studi tidak sesuai."},{status:403});const db=requireDb();const existing=await db.select({id:curricula.id}).from(curricula).where(eq(curricula.code,p.data.code)).limit(1);const versionNumber=existing.length?Math.max(...(await db.select({version:curricula.versionNumber}).from(curricula).where(eq(curricula.code,p.data.code))).map(x=>x.version))+1:1;const x=await db.insert(curricula).values({...p.data,totalCredits:p.data.totalCredits?.toString(),versionNumber,lifecycleStatus:"DRAFT"});const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"CREATE_CURRICULUM",subjectType:"CURRICULUM",subjectId:id,after:{...p.data,versionNumber}});return NextResponse.json({id,versionNumber,status:"DRAFT"},{status:201});}
