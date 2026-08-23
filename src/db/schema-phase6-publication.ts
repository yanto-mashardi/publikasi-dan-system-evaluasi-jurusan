import { bigint,mysqlTable,primaryKey,timestamp } from "drizzle-orm/mysql-core";

export const laboratoryProfilePrograms=mysqlTable("laboratory_profile_programs",{
  laboratoryProfileId:bigint("laboratory_profile_id",{mode:"number"}).notNull(),
  studyProgramId:bigint("study_program_id",{mode:"number"}).notNull(),
  snapshotAt:timestamp("snapshot_at").defaultNow().notNull(),
},t=>[primaryKey({columns:[t.laboratoryProfileId,t.studyProgramId]})]);
