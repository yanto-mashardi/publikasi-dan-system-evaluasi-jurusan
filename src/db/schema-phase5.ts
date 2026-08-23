import { bigint, date, decimal, int, json, mysqlTable, primaryKey, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

const id=(name="id")=>bigint(name,{mode:"number"}).autoincrement().primaryKey();

export const governanceScopes=mysqlTable("governance_scopes",{
  id:id(),
  subjectType:varchar("subject_type",{length:100}).notNull(),
  subjectId:bigint("subject_id",{mode:"number"}).notNull(),
  organizationId:bigint("organization_id",{mode:"number"}).notNull(),
  studyProgramId:bigint("study_program_id",{mode:"number"}),
  createdAt:timestamp("created_at").defaultNow().notNull(),
},t=>[uniqueIndex("governance_scope_subject_uq").on(t.subjectType,t.subjectId)]);

export const curricula=mysqlTable("curricula",{
  id:id(),
  studyProgramId:bigint("study_program_id",{mode:"number"}).notNull(),
  code:varchar("code",{length:80}).notNull(),
  title:varchar("title",{length:500}).notNull(),
  versionNumber:int("version_number").notNull().default(1),
  academicYearStart:int("academic_year_start"),
  academicYearEnd:int("academic_year_end"),
  totalCredits:decimal("total_credits",{precision:8,scale:2}),
  description:text("description"),
  lifecycleStatus:varchar("lifecycle_status",{length:30}).notNull().default("DRAFT"),
  effectiveFrom:date("effective_from"),
  effectiveTo:date("effective_to"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("curriculum_code_version_uq").on(t.studyProgramId,t.code,t.versionNumber)]);

export const graduateProfiles=mysqlTable("graduate_profiles",{
  id:id(),curriculumId:bigint("curriculum_id",{mode:"number"}).notNull(),code:varchar("code",{length:50}).notNull(),description:text("description").notNull(),sequence:int("sequence").notNull().default(1),status:varchar("status",{length:30}).notNull().default("ACTIVE")
});

export const cpl=mysqlTable("cpl",{
  id:id(),curriculumId:bigint("curriculum_id",{mode:"number"}).notNull(),code:varchar("code",{length:50}).notNull(),category:varchar("category",{length:50}),description:text("description").notNull(),sequence:int("sequence").notNull().default(1),status:varchar("status",{length:30}).notNull().default("ACTIVE")
},t=>[uniqueIndex("cpl_curriculum_code_uq").on(t.curriculumId,t.code)]);

export const courses=mysqlTable("courses",{
  id:id(),studyProgramId:bigint("study_program_id",{mode:"number"}).notNull(),code:varchar("code",{length:50}).notNull(),name:varchar("name",{length:255}).notNull(),credits:decimal("credits",{precision:5,scale:2}).notNull(),courseType:varchar("course_type",{length:50}),status:varchar("status",{length:30}).notNull().default("ACTIVE")
},t=>[uniqueIndex("course_program_code_uq").on(t.studyProgramId,t.code)]);

export const curriculumCourses=mysqlTable("curriculum_courses",{
  id:id(),curriculumId:bigint("curriculum_id",{mode:"number"}).notNull(),courseId:bigint("course_id",{mode:"number"}).notNull(),semester:int("semester").notNull(),creditsOverride:decimal("credits_override",{precision:5,scale:2})
},t=>[uniqueIndex("curriculum_course_uq").on(t.curriculumId,t.courseId)]);

export const cpmk=mysqlTable("cpmk",{
  id:id(),curriculumCourseId:bigint("curriculum_course_id",{mode:"number"}).notNull(),code:varchar("code",{length:50}).notNull(),description:text("description").notNull(),sequence:int("sequence").notNull().default(1),status:varchar("status",{length:30}).notNull().default("ACTIVE")
},t=>[uniqueIndex("cpmk_course_code_uq").on(t.curriculumCourseId,t.code)]);

export const cpmkCplMappings=mysqlTable("cpmk_cpl_mappings",{
  cpmkId:bigint("cpmk_id",{mode:"number"}).notNull(),cplId:bigint("cpl_id",{mode:"number"}).notNull(),weight:decimal("weight",{precision:8,scale:4})
},t=>[primaryKey({columns:[t.cpmkId,t.cplId]})]);

export const curriculumReviewCycles=mysqlTable("curriculum_review_cycles",{
  id:id(),curriculumId:bigint("curriculum_id",{mode:"number"}).notNull(),period:varchar("period",{length:50}).notNull(),reviewType:varchar("review_type",{length:80}).notNull().default("PERIODIC"),stakeholders:json("stakeholders"),evaluationId:bigint("evaluation_id",{mode:"number"}),status:varchar("status",{length:30}).notNull().default("DRAFT"),startedAt:timestamp("started_at").defaultNow().notNull(),completedAt:timestamp("completed_at")
});

export const obeImports=mysqlTable("obe_imports",{
  id:id(),studyProgramId:bigint("study_program_id",{mode:"number"}).notNull(),sourceType:varchar("source_type",{length:50}).notNull(),sourceReference:varchar("source_reference",{length:1000}),summary:json("summary"),status:varchar("status",{length:30}).notNull().default("STAGED"),importedBy:bigint("imported_by",{mode:"number"}).notNull(),createdAt:timestamp("created_at").defaultNow().notNull(),completedAt:timestamp("completed_at")
});
