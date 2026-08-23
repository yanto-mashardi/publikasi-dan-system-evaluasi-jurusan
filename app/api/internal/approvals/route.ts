import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { approvals,evaluations,kpiMeasurements,strategicStatements } from "@/src/db/schema";
import { newsArticles } from "@/src/db/schema-admin";
import { getSession } from "@/src/lib/auth";
import { audit } from "@/src/lib/audit";
import { can } from "@/src/lib/rbac";

const input=z.object({subjectType:z.enum(["STRATEGIC_STATEMENT","KPI_MEASUREMENT","EVALUATION","FOLLOWUP","NEWS_ARTICLE"]),subjectId:z.number().int().positive(),decision:z.enum(["APPROVED","REJECTED","REVISION"]),note:z.string().optional()});
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"approval.final"))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const x=await db.insert(approvals).values({...p.data,approvalLevel:"UPPS",approverId:s.userId});if(p.data.decision==="APPROVED"){if(p.data.subjectType==="STRATEGIC_STATEMENT")await db.update(strategicStatements).set({lifecycleStatus:"EFFECTIVE"}).where(eq(strategicStatements.id,p.data.subjectId));if(p.data.subjectType==="KPI_MEASUREMENT")await db.update(kpiMeasurements).set({workflowStatus:"APPROVED"}).where(eq(kpiMeasurements.id,p.data.subjectId));if(p.data.subjectType==="EVALUATION")await db.update(evaluations).set({status:"APPROVED"}).where(eq(evaluations.id,p.data.subjectId));if(p.data.subjectType==="NEWS_ARTICLE")await db.update(newsArticles).set({lifecycleStatus:"APPROVED",approvedBy:s.userId,updatedAt:new Date()}).where(eq(newsArticles.id,p.data.subjectId));}else if(p.data.subjectType==="NEWS_ARTICLE"){await db.update(newsArticles).set({lifecycleStatus:"DRAFT",approvedBy:null,updatedAt:new Date()}).where(eq(newsArticles.id,p.data.subjectId));}const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"APPROVAL_DECISION",subjectType:p.data.subjectType,subjectId:p.data.subjectId,after:{decision:p.data.decision,note:p.data.note}});return NextResponse.json({id,...p.data},{status:201});}
