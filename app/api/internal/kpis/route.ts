import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { kpis } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { audit } from "@/src/lib/audit";
import { can,scopeAllows } from "@/src/lib/rbac";
const input=z.object({strategicGoalId:z.number().int().positive(),ownerOrganizationId:z.number().int().positive(),code:z.string().min(2),name:z.string().min(3),definition:z.string().optional(),formula:z.string().optional(),unit:z.string().optional(),direction:z.enum(["HIGHER_IS_BETTER","LOWER_IS_BETTER","EXACT"]).default("HIGHER_IS_BETTER")});
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});const db=requireDb();return NextResponse.json(await db.select().from(kpis));}
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!(can(s,"data.create")||can(s,"program.update")))return NextResponse.json({error:"Forbidden"},{status:403});const parsed=input.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});if(!scopeAllows(s,parsed.data.ownerOrganizationId))return NextResponse.json({error:"Scope organisasi tidak sesuai."},{status:403});const db=requireDb();const r=await db.insert(kpis).values({...parsed.data,lifecycleStatus:"DRAFT"});const newId=Number(r[0].insertId);await audit({actorId:s.userId,action:"CREATE",subjectType:"KPI",subjectId:newId,after:parsed.data});return NextResponse.json({id:newId,status:"DRAFT"},{status:201});}
