import { bigint, boolean, json, mysqlTable, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

const id=(name="id")=>bigint(name,{mode:"number"}).autoincrement().primaryKey();

export const roleSettings=mysqlTable("role_settings",{
  roleId:bigint("role_id",{mode:"number"}).primaryKey(),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  isSystemRole:boolean("is_system_role").notNull().default(false),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
});

export const federatedApplications=mysqlTable("federated_applications",{
  id:id(),
  code:varchar("code",{length:80}).notNull(),
  name:varchar("name",{length:255}).notNull(),
  baseUrl:varchar("base_url",{length:700}).notNull(),
  organizationCode:varchar("organization_code",{length:80}),
  encryptedAccessToken:text("encrypted_access_token"),
  connectionStatus:varchar("connection_status",{length:30}).notNull().default("NOT_CHECKED"),
  lastHealthAt:timestamp("last_health_at"),
  lastSyncAt:timestamp("last_sync_at"),
  lastError:text("last_error"),
  summarySnapshot:json("summary_snapshot"),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("federated_application_code_uq").on(t.code),uniqueIndex("federated_application_url_uq").on(t.baseUrl)]);

export const newsCategories=mysqlTable("news_categories",{
  id:id(),
  name:varchar("name",{length:150}).notNull(),
  slug:varchar("slug",{length:180}).notNull(),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("news_category_slug_uq").on(t.slug)]);

export const newsArticles=mysqlTable("news_articles",{
  id:id(),
  organizationId:bigint("organization_id",{mode:"number"}).notNull(),
  categoryId:bigint("category_id",{mode:"number"}),
  title:varchar("title",{length:500}).notNull(),
  slug:varchar("slug",{length:550}).notNull(),
  excerpt:text("excerpt"),
  body:text("body").notNull(),
  coverImageUrl:varchar("cover_image_url",{length:1200}),
  lifecycleStatus:varchar("lifecycle_status",{length:30}).notNull().default("DRAFT"),
  featured:boolean("featured").notNull().default(false),
  authorId:bigint("author_id",{mode:"number"}).notNull(),
  approvedBy:bigint("approved_by",{mode:"number"}),
  publishedAt:timestamp("published_at"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("news_article_slug_uq").on(t.slug)]);
