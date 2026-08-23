import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { courses } from "@/src/db/schema-phase5";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";
import { canAccessProgram } from "@/src/services/academic-scope";
const input=z.object({studyProgramId:z.number().int().positive(),code:z.string().min(1).max(50),name:z.string().min(2).max(255),credits:z.number().positive(),courseType:z.string().max(50).optional()});
export async function GET(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});const id=Number(new URL(req.url).searchParams.get("studyProgramId"));if(!id||!(await canAccessProgram(s,id)))return NextResponse.json({error:"Scope Program Studi tidak sesuai."},{status:403});const db=requireDb();return NextResponse.json(await db.select().from(courses).where(eq(courses.studyProgramId,id)));}
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!(can(s,"curriculum.manage")||can(s,"data.create")))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});if(!(await canAccessProgram(s,p.data.studyProgramId)))return NextResponse.json({error:"Scope Program Studi tidak sesuai."},{status:403});const db=requireDb();const x=await db.insert(courses).values({...p.data,credits:String(p.data.credits)});const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"CREATE_COURSE",subjectType:"COURSE",subjectId:id,after:p.data});return NextResponse.json({id},{status:201});}
