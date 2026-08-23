import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { approvals,publications } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { audit } from "@/src/lib/audit";
import { can } from "@/src/lib/rbac";
import { publishApproved } from "@/src/services/publication";
const input=z.object({subjectType:z.enum(["STRATEGIC_STATEMENT","KPI_MEASUREMENT","EVALUATION","NEWS_ARTICLE","CURRICULUM"]),subjectId:z.number().int().positive(),publicTitle:z.string().optional(),publicSummary:z.string().optional()});
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});const db=requireDb();const approved=await db.select().from(approvals).where(eq(approvals.decision,"APPROVED"));const published=await db.select({subjectType:publications.subjectType,subjectId:publications.subjectId,status:publications.status}).from(publications).where(eq(publications.status,"PUBLISHED"));const keys=new Set(published.map(x=>`${x.subjectType}:${x.subjectId}`));return NextResponse.json({ready:approved.filter(x=>!keys.has(`${x.subjectType}:${x.subjectId}`)),published});}
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"publication.execute"))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});try{const id=await publishApproved({...p.data,publishedBy:s.userId});await audit({actorId:s.userId,action:"PUBLISH",subjectType:p.data.subjectType,subjectId:p.data.subjectId,after:{publicationId:id}});return NextResponse.json({publicationId:id,status:"PUBLISHED"},{status:201});}catch(e){return NextResponse.json({error:e instanceof Error?e.message:"Publication failed"},{status:409});}}
