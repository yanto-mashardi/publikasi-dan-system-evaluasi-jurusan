import { and, desc, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/src/db";
import { publications } from "@/src/db/schema";
import { newsArticles,newsCategories } from "@/src/db/schema-admin";

export async function GET(){const db=requireDb();const rows=await db.select({id:newsArticles.id,title:newsArticles.title,slug:newsArticles.slug,excerpt:newsArticles.excerpt,coverImageUrl:newsArticles.coverImageUrl,featured:newsArticles.featured,category:newsCategories.name,publishedAt:newsArticles.publishedAt}).from(publications).innerJoin(newsArticles,eq(publications.subjectId,newsArticles.id)).leftJoin(newsCategories,eq(newsArticles.categoryId,newsCategories.id)).where(and(eq(publications.subjectType,"NEWS_ARTICLE"),eq(publications.status,"PUBLISHED"),eq(publications.visibility,"PUBLIC"),eq(newsArticles.lifecycleStatus,"PUBLISHED"))).orderBy(desc(newsArticles.publishedAt));return NextResponse.json(rows);}
