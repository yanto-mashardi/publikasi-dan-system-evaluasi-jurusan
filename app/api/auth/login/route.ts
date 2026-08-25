import { compare } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/src/db";
import { permissions,rolePermissions,roles,userRoles,users } from "@/src/db/schema";
import { roleSettings } from "@/src/db/schema-admin";
import { createSession } from "@/src/lib/auth";
import { isMasterApplication } from "@/src/lib/application-mode";
import { applicationUrl } from "@/src/lib/request-url";

export async function POST(request:Request){
  const form=await request.formData();
  const email=String(form.get("email")??"").trim().toLowerCase();
  const password=String(form.get("password")??"");
  const db=requireDb();
  const [user]=await db.select({userId:users.id,email:users.email,name:users.name,passwordHash:users.passwordHash,status:users.status}).from(users).where(eq(users.email,email)).limit(1);
  if(!user||user.status!=="ACTIVE"||!(await compare(password,user.passwordHash)))return NextResponse.json({error:"Email atau password salah."},{status:401});
  const grants=await db.select({roleCode:roles.code,roleStatus:roleSettings.status,organizationId:userRoles.organizationId,studyProgramId:userRoles.studyProgramId,permissionCode:permissions.code})
    .from(userRoles)
    .innerJoin(roles,eq(userRoles.roleId,roles.id))
    .leftJoin(roleSettings,eq(roleSettings.roleId,roles.id))
    .leftJoin(rolePermissions,eq(rolePermissions.roleId,roles.id))
    .leftJoin(permissions,eq(permissions.id,rolePermissions.permissionId))
    .where(eq(userRoles.userId,user.userId));
  const active=grants.filter(g=>!g.roleStatus||g.roleStatus==="ACTIVE");
  if(!active.length)return NextResponse.json({error:"User belum mempunyai role aktif."},{status:403});
  const roleList=[...new Set(active.map(g=>g.roleCode))];
  const permissionList=[...new Set(active.map(g=>g.permissionCode).filter((x):x is string=>Boolean(x)))];
  const scopeMap=new Map<string,{role:string;organizationId:number;studyProgramId?:number|null}>();
  for(const g of active){const key=`${g.roleCode}:${g.organizationId}:${g.studyProgramId??"*"}`;scopeMap.set(key,{role:g.roleCode,organizationId:g.organizationId,studyProgramId:g.studyProgramId});}
  const scopes=[...scopeMap.values()];
  const primary=scopes[0];
  await createSession({userId:user.userId,email:user.email,name:user.name,roles:roleList,permissions:permissionList,scopes,role:primary?.role,organizationId:primary?.organizationId,studyProgramId:primary?.studyProgramId});
  return NextResponse.redirect(applicationUrl(request,isMasterApplication()?"/internal/accreditation":"/internal"),303);
}
