import { bigint, boolean, date, decimal, int, json, mysqlTable, primaryKey, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

const id=(name="id")=>bigint(name,{mode:"number"}).autoincrement().primaryKey();

export const laboratories=mysqlTable("laboratories",{
  id:id(),
  organizationId:bigint("organization_id",{mode:"number"}).notNull(),
  code:varchar("code",{length:80}).notNull(),
  operationalStatus:varchar("operational_status",{length:30}).notNull().default("ACTIVE"),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("laboratory_org_code_uq").on(t.organizationId,t.code)]);

export const laboratoryProfiles=mysqlTable("laboratory_profiles",{
  id:id(),
  laboratoryId:bigint("laboratory_id",{mode:"number"}).notNull(),
  versionNumber:int("version_number").notNull().default(1),
  name:varchar("name",{length:255}).notNull(),
  description:text("description"),
  location:varchar("location",{length:500}),
  picUserId:bigint("pic_user_id",{mode:"number"}),
  lifecycleStatus:varchar("lifecycle_status",{length:30}).notNull().default("DRAFT"),
  effectiveFrom:date("effective_from",{mode:"string"}),
  effectiveTo:date("effective_to",{mode:"string"}),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("laboratory_profile_version_uq").on(t.laboratoryId,t.versionNumber)]);

export const laboratoryPrograms=mysqlTable("laboratory_programs",{
  laboratoryId:bigint("laboratory_id",{mode:"number"}).notNull(),
  studyProgramId:bigint("study_program_id",{mode:"number"}).notNull(),
},t=>[primaryKey({columns:[t.laboratoryId,t.studyProgramId]})]);

export const laboratoryEquipment=mysqlTable("laboratory_equipment",{
  id:id(),
  laboratoryId:bigint("laboratory_id",{mode:"number"}).notNull(),
  assetCode:varchar("asset_code",{length:100}),
  name:varchar("name",{length:255}).notNull(),
  category:varchar("category",{length:100}),
  quantity:int("quantity").notNull().default(1),
  unit:varchar("unit",{length:50}),
  conditionStatus:varchar("condition_status",{length:30}).notNull().default("GOOD"),
  acquisitionYear:int("acquisition_year"),
  notes:text("notes"),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
});

export const laboratoryUsage=mysqlTable("laboratory_usage",{
  id:id(),
  laboratoryId:bigint("laboratory_id",{mode:"number"}).notNull(),
  studyProgramId:bigint("study_program_id",{mode:"number"}),
  activityType:varchar("activity_type",{length:50}).notNull(),
  title:varchar("title",{length:500}).notNull(),
  usageDate:date("usage_date",{mode:"string"}).notNull(),
  participantCount:int("participant_count").notNull().default(0),
  durationHours:decimal("duration_hours",{precision:8,scale:2}),
  recordedBy:bigint("recorded_by",{mode:"number"}).notNull(),
  status:varchar("status",{length:30}).notNull().default("RECORDED"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
});

export const laboratoryMaintenance=mysqlTable("laboratory_maintenance",{
  id:id(),
  equipmentId:bigint("equipment_id",{mode:"number"}).notNull(),
  maintenanceType:varchar("maintenance_type",{length:80}).notNull(),
  description:text("description").notNull(),
  scheduledDate:date("scheduled_date",{mode:"string"}),
  completedDate:date("completed_date",{mode:"string"}),
  cost:decimal("cost",{precision:18,scale:2}),
  provider:varchar("provider",{length:255}),
  recordedBy:bigint("recorded_by",{mode:"number"}).notNull(),
  status:varchar("status",{length:30}).notNull().default("PLANNED"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
});

export const laboratoryK3lChecks=mysqlTable("laboratory_k3l_checks",{
  id:id(),
  laboratoryId:bigint("laboratory_id",{mode:"number"}).notNull(),
  checkDate:date("check_date",{mode:"string"}).notNull(),
  score:decimal("score",{precision:7,scale:2}),
  checklist:json("checklist"),
  findings:text("findings"),
  correctiveAction:text("corrective_action"),
  evaluatorId:bigint("evaluator_id",{mode:"number"}).notNull(),
  status:varchar("status",{length:30}).notNull().default("DRAFT"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
});

export const personnel=mysqlTable("personnel",{
  id:id(),
  organizationId:bigint("organization_id",{mode:"number"}).notNull(),
  studyProgramId:bigint("study_program_id",{mode:"number"}),
  personnelType:varchar("personnel_type",{length:50}).notNull(),
  employeeCode:varchar("employee_code",{length:100}),
  name:varchar("name",{length:255}).notNull(),
  academicRank:varchar("academic_rank",{length:150}),
  functionalPosition:varchar("functional_position",{length:150}),
  educationLevel:varchar("education_level",{length:80}),
  expertise:varchar("expertise",{length:500}),
  googleScholarId:varchar("google_scholar_id",{length:100}),
  lecturerStatus:varchar("lecturer_status",{length:40}),
  originUnit:varchar("origin_unit",{length:255}),
  scholarCitationCount:int("scholar_citation_count"),
  scholarHIndex:int("scholar_h_index"),
  scholarI10Index:int("scholar_i10_index"),
  scholarLastSyncedAt:timestamp("scholar_last_synced_at"),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
});

export const scholarlyPublications=mysqlTable("scholarly_publications",{
  id:id(),
  personnelId:bigint("personnel_id",{mode:"number"}).notNull(),
  title:varchar("title",{length:1000}).notNull(),
  venue:varchar("venue",{length:500}),
  publicationYear:int("publication_year"),
  citationCount:int("citation_count").notNull().default(0),
  source:varchar("source",{length:40}).notNull().default("MANUAL"),
  externalId:varchar("external_id",{length:255}),
  sourceUrl:varchar("source_url",{length:1000}),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},table=>[uniqueIndex("scholarly_publication_source_uq").on(table.personnelId,table.source,table.externalId)]);

export const personnelSemesterAssignments=mysqlTable("personnel_semester_assignments",{
  id:id(),
  personnelId:bigint("personnel_id",{mode:"number"}).notNull(),
  studyProgramId:bigint("study_program_id",{mode:"number"}).notNull(),
  period:varchar("period",{length:50}).notNull(),
  courseCode:varchar("course_code",{length:80}).notNull(),
  courseName:varchar("course_name",{length:500}).notNull(),
  credits:decimal("credits",{precision:5,scale:2}),
  expertiseAligned:boolean("expertise_aligned").notNull().default(false),
  bokAligned:boolean("bok_aligned").notNull().default(false),
  tridharmaActive:boolean("tridharma_active").notNull().default(false),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},table=>[uniqueIndex("personnel_semester_assignment_uq").on(table.personnelId,table.studyProgramId,table.period,table.courseCode)]);

export const researchProjects=mysqlTable("research_projects",{
  id:id(),
  organizationId:bigint("organization_id",{mode:"number"}).notNull(),
  studyProgramId:bigint("study_program_id",{mode:"number"}),
  title:varchar("title",{length:700}).notNull(),
  year:int("year").notNull(),
  period:varchar("period",{length:50}),
  principalPersonnelId:bigint("principal_personnel_id",{mode:"number"}),
  fundingSource:varchar("funding_source",{length:255}),
  scheme:varchar("scheme",{length:255}),
  outputSummary:text("output_summary"),
  projectStatus:varchar("project_status",{length:30}).notNull().default("ONGOING"),
  lifecycleStatus:varchar("lifecycle_status",{length:30}).notNull().default("DRAFT"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
});

export const communityServiceProjects=mysqlTable("community_service_projects",{
  id:id(),
  organizationId:bigint("organization_id",{mode:"number"}).notNull(),
  studyProgramId:bigint("study_program_id",{mode:"number"}),
  title:varchar("title",{length:700}).notNull(),
  year:int("year").notNull(),
  period:varchar("period",{length:50}),
  leadPersonnelId:bigint("lead_personnel_id",{mode:"number"}),
  partner:varchar("partner",{length:255}),
  fundingSource:varchar("funding_source",{length:255}),
  outputSummary:text("output_summary"),
  projectStatus:varchar("project_status",{length:30}).notNull().default("ONGOING"),
  lifecycleStatus:varchar("lifecycle_status",{length:30}).notNull().default("DRAFT"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
});

export const studentAnnualStats=mysqlTable("student_annual_stats",{
  id:id(),
  studyProgramId:bigint("study_program_id",{mode:"number"}).notNull(),
  academicYear:varchar("academic_year",{length:20}).notNull(),
  activeStudents:int("active_students").notNull().default(0),
  newStudents:int("new_students").notNull().default(0),
  graduates:int("graduates").notNull().default(0),
  dropoutStudents:int("dropout_students").notNull().default(0),
  lifecycleStatus:varchar("lifecycle_status",{length:30}).notNull().default("DRAFT"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("student_stat_program_year_uq").on(t.studyProgramId,t.academicYear)]);

export const graduateOutcomeStats=mysqlTable("graduate_outcome_stats",{
  id:id(),
  studyProgramId:bigint("study_program_id",{mode:"number"}).notNull(),
  graduationYear:int("graduation_year").notNull(),
  graduates:int("graduates").notNull().default(0),
  trackedGraduates:int("tracked_graduates").notNull().default(0),
  employed:int("employed").notNull().default(0),
  entrepreneurship:int("entrepreneurship").notNull().default(0),
  furtherStudy:int("further_study").notNull().default(0),
  averageWaitingMonths:decimal("average_waiting_months",{precision:8,scale:2}),
  relevantEmploymentPercent:decimal("relevant_employment_percent",{precision:7,scale:2}),
  lifecycleStatus:varchar("lifecycle_status",{length:30}).notNull().default("DRAFT"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("graduate_outcome_program_year_uq").on(t.studyProgramId,t.graduationYear)]);

export const cooperations=mysqlTable("cooperations",{
  id:id(),
  organizationId:bigint("organization_id",{mode:"number"}).notNull(),
  studyProgramId:bigint("study_program_id",{mode:"number"}),
  partnerName:varchar("partner_name",{length:500}).notNull(),
  partnerType:varchar("partner_type",{length:100}),
  scope:text("scope").notNull(),
  startDate:date("start_date",{mode:"string"}),
  endDate:date("end_date",{mode:"string"}),
  implementationSummary:text("implementation_summary"),
  cooperationStatus:varchar("cooperation_status",{length:30}).notNull().default("ACTIVE"),
  lifecycleStatus:varchar("lifecycle_status",{length:30}).notNull().default("DRAFT"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
});
