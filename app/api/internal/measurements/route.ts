import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { kpiMeasurements,kpis,kpiTargets } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { audit } from "@/src/lib/audit";
import { calculateAchievement,type Direction } from "@/src/lib/kpi";
import { can } from "@/src/lib/rbac";
const input=z.object({kpiId:z.number().int().positive(),period:z.string().min(4),actualValue:z.number()});
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!(can(s,"kpi.measure")||can(s,"data.update")))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const[k]=await db.select().from(kpis).where(eq(kpis.id,p.data.kpiId)).limit(1);const[t]=await db.select().from(kpiTargets).where(and(eq(kpiTargets.kpiId,p.data.kpiId),eq(kpiTargets.period,p.data.period))).limit(1);if(!k||!t)return NextResponse.json({error:"KPI/target periode tidak ditemukan."},{status:404});const calc=calculateAchievement(Number(t.targetValue),p.data.actualValue,k.direction as Direction);const r=await db.insert(kpiMeasurements).values({kpiId:k.id,period:p.data.period,actualValue:String(p.data.actualValue),achievementPercent:String(calc.percent),status:calc.status,workflowStatus:"SUBMITTED",measuredBy:s.userId});const id=Number(r[0].insertId);await audit({actorId:s.userId,action:"MEASURE",subjectType:"KPI_MEASUREMENT",subjectId:id,after:{...p.data,...calc}});return NextResponse.json({id,...calc,workflowStatus:"SUBMITTED"},{status:201});}
