import mysql from "mysql2/promise";
import { drizzle } from "drizzle-orm/mysql2";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;
const pool = databaseUrl ? mysql.createPool(databaseUrl) : null;
export const db = pool ? drizzle(pool, { schema, mode: "default" }) : null;
export function requireDb() {
  if (!db) throw new Error("DATABASE_URL belum dikonfigurasi.");
  return db;
}
