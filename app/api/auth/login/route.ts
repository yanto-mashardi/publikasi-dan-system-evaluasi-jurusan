import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/src/db";
import { roles,userRoles,users } from "@/src/db/schema";
import { createSession } from "@/src/lib/auth";
export async function POST(request:Request){const form=await request.formData();const email=String(form.get("email")??"").trim().toLowerCase();const password=String(form.get("password")??"");const db=requireDb();const rows=await db.select({userId:users.id,email:users.email,name:users.name,passwordHash:users.passwordHash,status:users.status,roleCode:roles.code,organizationId:userRoles.organizationId,studyProgramId:userRoles.studyProgramId}).from(users).innerJoin(userRoles,eq(users.id,userRoles.userId)).innerJoin(roles,eq(userRoles.roleId,roles.id)).where(eq(users.email,email)).limit(1);const row=rows[0];if(!row||row.status!=="ACTIVE"||!(await compare(password,row.passwordHash)))return NextResponse.json({error:"Email atau password salah."},{status:401});await createSession({userId:row.userId,email:row.email,name:row.name,role:row.roleCode,organizationId:row.organizationId,studyProgramId:row.studyProgramId});return NextResponse.redirect(new URL("/internal",request.url),303);}
