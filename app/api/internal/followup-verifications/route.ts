import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { followupVerifications,followups } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";
import { subjectWriteScopeAllows } from "@/src/services/subject-scope";
const input=z.object({followupId:z.number().int().positive(),effective:z.boolean(),note:z.string().optional()});
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"followup.verify"))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});if(!(await subjectWriteScopeAllows(s,"FOLLOWUP",p.data.followupId)))return NextResponse.json({error:"Verifier tidak memiliki write scope terhadap tindak lanjut ini."},{status:403});const db=requireDb();const[followup]=await db.select({id:followups.id}).from(followups).where(eq(followups.id,p.data.followupId)).limit(1);if(!followup)return NextResponse.json({error:"Tindak lanjut tidak ditemukan."},{status:404});const x=await db.insert(followupVerifications).values({followupId:p.data.followupId,verifierId:s.userId,effective:p.data.effective,note:p.data.note});await db.update(followups).set({status:p.data.effective?"CLOSED":"REOPENED"}).where(eq(followups.id,p.data.followupId));const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"VERIFY_FOLLOWUP",subjectType:"FOLLOWUP",subjectId:p.data.followupId,after:p.data});return NextResponse.json({id,status:p.data.effective?"CLOSED":"REOPENED"},{status:201});}
