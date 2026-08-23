import { loadEnvFile } from "node:process";
import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as coreSchema from "./schema";
import * as adminSchema from "./schema-admin";
import * as phase5Schema from "./schema-phase5";
import * as phase6Schema from "./schema-phase6";
import * as phase6PublicationSchema from "./schema-phase6-publication";
import * as accreditationSchema from "./schema-accreditation";

if(!process.env.DATABASE_URL){for(const file of [".env.local",".env"]){try{loadEnvFile(file);break}catch{}}}
const databaseUrl=process.env.DATABASE_URL;
const pool=databaseUrl?mysql.createPool(databaseUrl):null;
const schema={...coreSchema,...adminSchema,...phase5Schema,...phase6Schema,...phase6PublicationSchema,...accreditationSchema};
export const db=pool?drizzle(pool,{schema,mode:"default"}):null;
export function requireDb(){if(!db)throw new Error("DATABASE_URL belum dikonfigurasi. Isi .env.local atau environment variable.");return db;}
