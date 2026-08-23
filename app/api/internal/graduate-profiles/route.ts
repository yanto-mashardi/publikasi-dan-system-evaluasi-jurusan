import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { graduateProfiles } from "@/src/db/schema-phase5";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";
import { canAccessCurriculum } from "@/src/services/academic-scope";
const input=z.object({curriculumId:z.number().int().positive(),code:z.string().min(1).max(50),description:z.string().min(3),sequence:z.number().int().positive().default(1)});
export async function GET(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});const id=Number(new URL(req.url).searchParams.get("curriculumId"));if(!id||!(await canAccessCurriculum(s,id)))return NextResponse.json({error:"Scope kurikulum tidak sesuai."},{status:403});const db=requireDb();return NextResponse.json(await db.select().from(graduateProfiles).where(eq(graduateProfiles.curriculumId,id)));}
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!(can(s,"curriculum.manage")||can(s,"data.create")))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});if(!(await canAccessCurriculum(s,p.data.curriculumId)))return NextResponse.json({error:"Scope kurikulum tidak sesuai."},{status:403});const db=requireDb();const x=await db.insert(graduateProfiles).values(p.data);const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"CREATE_GRADUATE_PROFILE",subjectType:"GRADUATE_PROFILE",subjectId:id,after:p.data});return NextResponse.json({id},{status:201});}
