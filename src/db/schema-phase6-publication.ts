import { bigint,mysqlTable,primaryKey,timestamp } from "drizzle-orm/mysql-core";

export const laboratoryProfilePrograms=mysqlTable("laboratory_profile_programs",{
  laboratoryProfileId:bigint("laboratory_profile_id",{mode:"number"}).notNull(),
  studyProgramId:bigint("study_program_id",{mode:"number"}).notNull(),
  snapshotAt:timestamp("snapshot_at").defaultNow().notNull(),
},t=>[primaryKey({name:"lab_profile_program_pk",columns:[t.laboratoryProfileId,t.studyProgramId]})]);
