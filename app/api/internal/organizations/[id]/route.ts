import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { organizations } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";

const patch=z.object({parentId:z.number().int().positive().nullable().optional(),type:z.string().min(2).max(50).optional(),code:z.string().min(2).max(50).optional(),name:z.string().min(2).max(255).optional(),status:z.enum(["ACTIVE","ARCHIVED"]).optional()});
async function idOf(params:Promise<{id:string}>){const {id}=await params;const n=Number(id);return Number.isInteger(n)&&n>0?n:null;}
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"master.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const id=await idOf(params);if(!id)return NextResponse.json({error:"Invalid id"},{status:400});const p=patch.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const [before]=await db.select().from(organizations).where(eq(organizations.id,id)).limit(1);if(!before)return NextResponse.json({error:"Not found"},{status:404});const values={...p.data,...(p.data.code?{code:p.data.code.toUpperCase()}:{})};await db.update(organizations).set(values).where(eq(organizations.id,id));await audit({actorId:s.userId,action:"UPDATE_ORGANIZATION",subjectType:"ORGANIZATION",subjectId:id,before,after:values});return NextResponse.json({id,...values});}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"master.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const id=await idOf(params);if(!id)return NextResponse.json({error:"Invalid id"},{status:400});const db=requireDb();const [before]=await db.select().from(organizations).where(eq(organizations.id,id)).limit(1);if(!before)return NextResponse.json({error:"Not found"},{status:404});await db.update(organizations).set({status:"ARCHIVED"}).where(eq(organizations.id,id));await audit({actorId:s.userId,action:"ARCHIVE_ORGANIZATION",subjectType:"ORGANIZATION",subjectId:id,before,after:{status:"ARCHIVED"}});return NextResponse.json({id,status:"ARCHIVED"});}
