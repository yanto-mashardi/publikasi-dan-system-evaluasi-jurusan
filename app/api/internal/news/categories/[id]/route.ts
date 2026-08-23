import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { newsCategories } from "@/src/db/schema-admin";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";

const slugify=(s:string)=>s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const patch=z.object({name:z.string().min(2).max(150).optional(),slug:z.string().max(180).optional(),status:z.enum(["ACTIVE","ARCHIVED"]).optional()});
async function idOf(params:Promise<{id:string}>){const {id}=await params;const n=Number(id);return Number.isInteger(n)&&n>0?n:null;}
export async function PATCH(req:Request,{params}:{params:Promise<{id:string}>}){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"news.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const id=await idOf(params);if(!id)return NextResponse.json({error:"Invalid id"},{status:400});const p=patch.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const[before]=await db.select().from(newsCategories).where(eq(newsCategories.id,id)).limit(1);if(!before)return NextResponse.json({error:"Not found"},{status:404});const values={...p.data,...(p.data.slug?{slug:slugify(p.data.slug)}:{}),updatedAt:new Date()};await db.update(newsCategories).set(values).where(eq(newsCategories.id,id));await audit({actorId:s.userId,action:"UPDATE_NEWS_CATEGORY",subjectType:"NEWS_CATEGORY",subjectId:id,before,after:values});return NextResponse.json({id,...values});}
export async function DELETE(_:Request,{params}:{params:Promise<{id:string}>}){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"news.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const id=await idOf(params);if(!id)return NextResponse.json({error:"Invalid id"},{status:400});const db=requireDb();const[before]=await db.select().from(newsCategories).where(eq(newsCategories.id,id)).limit(1);if(!before)return NextResponse.json({error:"Not found"},{status:404});await db.update(newsCategories).set({status:"ARCHIVED",updatedAt:new Date()}).where(eq(newsCategories.id,id));await audit({actorId:s.userId,action:"ARCHIVE_NEWS_CATEGORY",subjectType:"NEWS_CATEGORY",subjectId:id,before,after:{status:"ARCHIVED"}});return NextResponse.json({id,status:"ARCHIVED"});}
