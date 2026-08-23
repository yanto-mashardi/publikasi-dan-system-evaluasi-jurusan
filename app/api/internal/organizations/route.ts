import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { organizations } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";

const input=z.object({parentId:z.number().int().positive().nullable().optional(),type:z.string().min(2).max(50),code:z.string().min(2).max(50),name:z.string().min(2).max(255)});
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"internal.read")&&!can(s,"master.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const db=requireDb();return NextResponse.json(await db.select().from(organizations));}
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"master.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const [existing]=await db.select({id:organizations.id}).from(organizations).where(eq(organizations.code,p.data.code.toUpperCase())).limit(1);if(existing)return NextResponse.json({error:"Kode organisasi sudah digunakan."},{status:409});const x=await db.insert(organizations).values({...p.data,code:p.data.code.toUpperCase(),status:"ACTIVE"});const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"CREATE_ORGANIZATION",subjectType:"ORGANIZATION",subjectId:id,after:p.data});return NextResponse.json({id},{status:201});}
