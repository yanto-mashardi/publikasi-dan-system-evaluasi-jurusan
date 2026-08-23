import Link from "next/link";
import { and, desc, eq } from "drizzle-orm";
import { requireDb } from "@/src/db";
import { publications } from "@/src/db/schema";
import { newsArticles,newsCategories } from "@/src/db/schema-admin";

export const dynamic="force-dynamic";
export default async function BeritaPage(){const db=requireDb();const rows=await db.select({title:newsArticles.title,slug:newsArticles.slug,excerpt:newsArticles.excerpt,category:newsCategories.name,publishedAt:newsArticles.publishedAt}).from(publications).innerJoin(newsArticles,eq(publications.subjectId,newsArticles.id)).leftJoin(newsCategories,eq(newsArticles.categoryId,newsCategories.id)).where(and(eq(publications.subjectType,"NEWS_ARTICLE"),eq(publications.status,"PUBLISHED"),eq(publications.visibility,"PUBLIC"),eq(newsArticles.lifecycleStatus,"PUBLISHED"))).orderBy(desc(newsArticles.publishedAt));return <main className="shell"><section className="hero"><div className="eyebrow">Informasi Publik</div><h1>Berita Jurusan</h1><p className="muted">Berita yang tampil di halaman ini berasal dari workflow internal dan telah dipublikasikan.</p></section><div className="grid">{rows.map(x=><article className="card" key={x.slug}><div className="eyebrow">{x.category??"Berita"}</div><h2>{x.title}</h2><p className="muted">{x.excerpt??""}</p><Link href={`/berita/${x.slug}`}>Baca berita →</Link></article>)}{!rows.length&&<div className="card"><p className="muted">Belum ada berita yang dipublikasikan.</p></div>}</div></main>}
