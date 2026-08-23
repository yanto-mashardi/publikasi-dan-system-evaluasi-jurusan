import { hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { roles,userRoles,users } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { audit } from "@/src/lib/audit";
import { can } from "@/src/lib/rbac";
const input=z.object({name:z.string().min(2),email:z.string().email(),password:z.string().min(10),roleCode:z.enum(["ADMIN_SYSTEM","ADMIN_DATA","KAPRODI","GKM","SEKJUR","KAJUR","VIEWER_INTERNAL"]),organizationId:z.number().int().positive(),studyProgramId:z.number().int().positive().optional()});
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"users.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const db=requireDb();return NextResponse.json(await db.select({id:users.id,name:users.name,email:users.email,status:users.status}).from(users));}
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"users.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const[role]=await db.select().from(roles).where(eq(roles.code,p.data.roleCode)).limit(1);if(!role)return NextResponse.json({error:"Role belum di-seed."},{status:409});const existing=await db.select({id:users.id}).from(users).where(eq(users.email,p.data.email.toLowerCase())).limit(1);if(existing[0])return NextResponse.json({error:"Email sudah digunakan."},{status:409});const x=await db.insert(users).values({name:p.data.name,email:p.data.email.toLowerCase(),passwordHash:await hash(p.data.password,12),status:"ACTIVE"});const userId=Number(x[0].insertId);await db.insert(userRoles).values({userId,roleId:role.id,organizationId:p.data.organizationId,studyProgramId:p.data.studyProgramId});await audit({actorId:s.userId,action:"CREATE_USER",subjectType:"USER",subjectId:userId,after:{name:p.data.name,email:p.data.email,roleCode:p.data.roleCode,organizationId:p.data.organizationId,studyProgramId:p.data.studyProgramId}});return NextResponse.json({id:userId,role:p.data.roleCode},{status:201});}
