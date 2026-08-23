import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { newsCategories } from "@/src/db/schema-admin";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";

const slugify=(s:string)=>s.toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const input=z.object({name:z.string().min(2).max(150),slug:z.string().max(180).optional()});
export async function GET(){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"news.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const db=requireDb();return NextResponse.json(await db.select().from(newsCategories));}
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(s,"news.manage"))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});const db=requireDb();const slug=slugify(p.data.slug||p.data.name);const[existing]=await db.select({id:newsCategories.id}).from(newsCategories).where(eq(newsCategories.slug,slug)).limit(1);if(existing)return NextResponse.json({error:"Slug kategori sudah digunakan."},{status:409});const x=await db.insert(newsCategories).values({name:p.data.name,slug,status:"ACTIVE"});const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"CREATE_NEWS_CATEGORY",subjectType:"NEWS_CATEGORY",subjectId:id,after:{name:p.data.name,slug}});return NextResponse.json({id,slug},{status:201});}
