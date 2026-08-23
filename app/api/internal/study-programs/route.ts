import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { studyPrograms } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";

const input=z.object({organizationId:z.number().int().positive(),code:z.string().min(2).max(50),name:z.string().min(2).max(255),level:z.string().max(50).optional()});
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"master.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const db=requireDb();return NextResponse.json(await db.select().from(studyPrograms));}
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"master.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const code=p.data.code.toUpperCase();const [existing]=await db.select({id:studyPrograms.id}).from(studyPrograms).where(eq(studyPrograms.code,code)).limit(1);if(existing)return NextResponse.json({error:"Kode Prodi sudah digunakan."},{status:409});const x=await db.insert(studyPrograms).values({...p.data,code,status:"ACTIVE"});const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"CREATE_STUDY_PROGRAM",subjectType:"STUDY_PROGRAM",subjectId:id,after:{...p.data,code}});return NextResponse.json({id},{status:201});}
