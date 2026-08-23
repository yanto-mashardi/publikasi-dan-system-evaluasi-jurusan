import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { followups,recommendations } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { audit } from "@/src/lib/audit";
import { can } from "@/src/lib/rbac";
import { subjectWriteScopeAllows } from "@/src/services/subject-scope";
const input=z.object({recommendationId:z.number().int().positive(),actionPlan:z.string().min(5),dueDate:z.string().optional()});
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!(can(s,"followup.execute")||can(s,"workflow.coordinate")))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const dueDate=p.data.dueDate?new Date(`${p.data.dueDate}T00:00:00`):undefined;if(dueDate&&Number.isNaN(dueDate.getTime()))return NextResponse.json({error:"Format dueDate tidak valid."},{status:400});const db=requireDb();const[recommendation]=await db.select({evaluationId:recommendations.evaluationId}).from(recommendations).where(eq(recommendations.id,p.data.recommendationId)).limit(1);if(!recommendation)return NextResponse.json({error:"Rekomendasi tidak ditemukan."},{status:404});if(!(await subjectWriteScopeAllows(s,"EVALUATION",recommendation.evaluationId)))return NextResponse.json({error:"User tidak memiliki write scope terhadap evaluasi sumber rekomendasi."},{status:403});const r=await db.insert(followups).values({recommendationId:p.data.recommendationId,actionPlan:p.data.actionPlan,picUserId:s.userId,dueDate,status:"OPEN",progressPercent:"0"});const id=Number(r[0].insertId);await audit({actorId:s.userId,action:"CREATE_FOLLOWUP",subjectType:"FOLLOWUP",subjectId:id,after:p.data});return NextResponse.json({id,status:"OPEN"},{status:201});}
