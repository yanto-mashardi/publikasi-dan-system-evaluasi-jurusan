import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/src/db";
import { publications } from "@/src/db/schema";
import { newsArticles,newsCategories } from "@/src/db/schema-admin";

export async function GET(_:Request,{params}:{params:Promise<{slug:string}>}){const {slug}=await params;const db=requireDb();const[article]=await db.select({id:newsArticles.id,title:newsArticles.title,slug:newsArticles.slug,excerpt:newsArticles.excerpt,body:newsArticles.body,coverImageUrl:newsArticles.coverImageUrl,featured:newsArticles.featured,category:newsCategories.name,publishedAt:newsArticles.publishedAt}).from(publications).innerJoin(newsArticles,eq(publications.subjectId,newsArticles.id)).leftJoin(newsCategories,eq(newsArticles.categoryId,newsCategories.id)).where(and(eq(publications.subjectType,"NEWS_ARTICLE"),eq(publications.status,"PUBLISHED"),eq(publications.visibility,"PUBLIC"),eq(newsArticles.lifecycleStatus,"PUBLISHED"),eq(newsArticles.slug,slug))).limit(1);if(!article)return NextResponse.json({error:"Not found"},{status:404});return NextResponse.json(article);}
