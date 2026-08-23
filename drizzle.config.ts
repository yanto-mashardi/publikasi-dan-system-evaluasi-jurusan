import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

if(!process.env.DATABASE_URL){for(const file of [".env.local",".env"]){try{loadEnvFile(file);break}catch{}}}

export default defineConfig({
  schema: ["./src/db/schema.ts","./src/db/schema-admin.ts","./src/db/schema-phase5.ts","./src/db/schema-phase6.ts","./src/db/schema-phase6-publication.ts","./src/db/schema-accreditation.ts"],
  out: "./drizzle",
  dialect: "mysql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "mysql://root:root@127.0.0.1:3306/evaluasi_jurusan",
  },
});
