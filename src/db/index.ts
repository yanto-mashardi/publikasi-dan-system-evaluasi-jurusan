import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as coreSchema from "./schema";
import * as adminSchema from "./schema-admin";
import * as phase5Schema from "./schema-phase5";

const databaseUrl=process.env.DATABASE_URL;
const pool=databaseUrl?mysql.createPool(databaseUrl):null;
const schema={...coreSchema,...adminSchema,...phase5Schema};
export const db=pool?drizzle(pool,{schema}):null;
export function requireDb(){if(!db)throw new Error("DATABASE_URL belum dikonfigurasi.");return db;}
