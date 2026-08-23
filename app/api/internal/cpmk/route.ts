import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { cpmk,curriculumCourses } from "@/src/db/schema-phase5";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";
import { canAccessCurriculum } from "@/src/services/academic-scope";
const input=z.object({curriculumCourseId:z.number().int().positive(),code:z.string().min(1).max(50),description:z.string().min(3),sequence:z.number().int().positive().default(1)});
async function curriculumOf(db:ReturnType<typeof requireDb>,curriculumCourseId:number){const[x]=await db.select({curriculumId:curriculumCourses.curriculumId}).from(curriculumCourses).where(eq(curriculumCourses.id,curriculumCourseId)).limit(1);return x?.curriculumId??null;}
export async function GET(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});const curriculumCourseId=Number(new URL(req.url).searchParams.get("curriculumCourseId"));const db=requireDb();const curriculumId=await curriculumOf(db,curriculumCourseId);if(!curriculumId||!(await canAccessCurriculum(s,curriculumId)))return NextResponse.json({error:"Scope kurikulum tidak sesuai."},{status:403});return NextResponse.json(await db.select().from(cpmk).where(eq(cpmk.curriculumCourseId,curriculumCourseId)));}
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!(can(s,"curriculum.manage")||can(s,"data.create")))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const curriculumId=await curriculumOf(db,p.data.curriculumCourseId);if(!curriculumId||!(await canAccessCurriculum(s,curriculumId)))return NextResponse.json({error:"Scope kurikulum tidak sesuai."},{status:403});const x=await db.insert(cpmk).values(p.data);const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"CREATE_CPMK",subjectType:"CPMK",subjectId:id,after:p.data});return NextResponse.json({id},{status:201});}
