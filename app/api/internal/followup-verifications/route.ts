import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { followupVerifications,followups } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";
const input=z.object({followupId:z.number().int().positive(),effective:z.boolean(),note:z.string().optional()});
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"followup.verify"))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const x=await db.insert(followupVerifications).values({followupId:p.data.followupId,verifierId:s.userId,effective:p.data.effective,note:p.data.note});await db.update(followups).set({status:p.data.effective?"CLOSED":"REOPENED"}).where(eq(followups.id,p.data.followupId));const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"VERIFY_FOLLOWUP",subjectType:"FOLLOWUP",subjectId:p.data.followupId,after:p.data});return NextResponse.json({id,status:p.data.effective?"CLOSED":"REOPENED"},{status:201});}
