import Link from "next/link";
import { and, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { requireDb } from "@/src/db";
import { publications } from "@/src/db/schema";
import { newsArticles,newsCategories } from "@/src/db/schema-admin";

export const dynamic="force-dynamic";
export default async function BeritaDetail({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const db=requireDb();const[article]=await db.select({title:newsArticles.title,excerpt:newsArticles.excerpt,body:newsArticles.body,category:newsCategories.name,publishedAt:newsArticles.publishedAt}).from(publications).innerJoin(newsArticles,eq(publications.subjectId,newsArticles.id)).leftJoin(newsCategories,eq(newsArticles.categoryId,newsCategories.id)).where(and(eq(publications.subjectType,"NEWS_ARTICLE"),eq(publications.status,"PUBLISHED"),eq(publications.visibility,"PUBLIC"),eq(newsArticles.lifecycleStatus,"PUBLISHED"),eq(newsArticles.slug,slug))).limit(1);if(!article)notFound();return <main className="shell"><p><Link href="/berita">← Semua berita</Link></p><article className="card"><div className="eyebrow">{article.category??"Berita"}</div><h1>{article.title}</h1>{article.excerpt&&<p className="muted">{article.excerpt}</p>}<div style={{whiteSpace:"pre-wrap",lineHeight:1.8}}>{article.body}</div></article></main>}
