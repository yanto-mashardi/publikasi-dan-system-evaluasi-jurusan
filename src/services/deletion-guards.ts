import { sql } from "drizzle-orm";
import { requireDb } from "@/src/db";

type ColumnRow = { tableName: string };

export async function findDatabaseReferences(columnName: string, value: number, excludedTables: string[] = []) {
  const db = requireDb();
  const result = await db.execute(sql`SELECT table_name AS tableName FROM information_schema.columns WHERE table_schema = DATABASE() AND column_name = ${columnName}`);
  const rows = result[0] as unknown as ColumnRow[];
  const references: string[] = [];
  for (const row of rows) {
    if (excludedTables.includes(row.tableName) || !/^[a-z0-9_]+$/i.test(row.tableName)) continue;
    const countResult = await db.execute(sql.raw(`SELECT COUNT(*) AS total FROM \`${row.tableName}\` WHERE \`${columnName}\` = ${Math.trunc(value)}`));
    const total = Number((countResult[0] as unknown as Array<{ total: number }>)[0]?.total ?? 0);
    if (total > 0) references.push(`${row.tableName} (${total})`);
  }
  return references;
}
