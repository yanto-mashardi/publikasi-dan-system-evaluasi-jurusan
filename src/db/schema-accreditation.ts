import { bigint, boolean, date, decimal, int, json, mysqlTable, primaryKey, text, timestamp, uniqueIndex, varchar } from "drizzle-orm/mysql-core";

const id=(name="id")=>bigint(name,{mode:"number"}).autoincrement().primaryKey();

export const accreditationAgencies=mysqlTable("accreditation_agencies",{
  id:id(),
  code:varchar("code",{length:80}).notNull(),
  name:varchar("name",{length:255}).notNull(),
  agencyType:varchar("agency_type",{length:40}).notNull().default("LAM"),
  websiteUrl:varchar("website_url",{length:1000}),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("accreditation_agency_code_uq").on(t.code)]);

export const accreditationFrameworks=mysqlTable("accreditation_frameworks",{
  id:id(),
  agencyId:bigint("agency_id",{mode:"number"}).notNull(),
  code:varchar("code",{length:120}).notNull(),
  name:varchar("name",{length:500}).notNull(),
  instrumentYear:int("instrument_year"),
  instrumentType:varchar("instrument_type",{length:120}),
  educationLevel:varchar("education_level",{length:80}),
  modality:varchar("modality",{length:80}).default("TATAP_MUKA"),
  regulationReference:varchar("regulation_reference",{length:500}),
  sourceUrl:varchar("source_url",{length:1200}),
  versionNumber:int("version_number").notNull().default(1),
  lifecycleStatus:varchar("lifecycle_status",{length:30}).notNull().default("DRAFT"),
  effectiveFrom:date("effective_from",{mode:"string"}),
  effectiveTo:date("effective_to",{mode:"string"}),
  notes:text("notes"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("accreditation_framework_code_version_uq").on(t.agencyId,t.code,t.versionNumber)]);

export const accreditationClusters=mysqlTable("accreditation_clusters",{
  id:id(),
  frameworkId:bigint("framework_id",{mode:"number"}).notNull(),
  code:varchar("code",{length:80}).notNull(),
  name:varchar("name",{length:255}).notNull(),
  semanticGroup:varchar("semantic_group",{length:50}),
  description:text("description"),
  sequence:int("sequence").notNull().default(1),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
},t=>[uniqueIndex("accreditation_cluster_framework_code_uq").on(t.frameworkId,t.code)]);

export const accreditationCriteria=mysqlTable("accreditation_criteria",{
  id:id(),
  frameworkId:bigint("framework_id",{mode:"number"}).notNull(),
  code:varchar("code",{length:80}).notNull(),
  name:varchar("name",{length:500}).notNull(),
  description:text("description"),
  sequence:int("sequence").notNull().default(1),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
},t=>[uniqueIndex("accreditation_criterion_framework_code_uq").on(t.frameworkId,t.code)]);

export const accreditationIndicators=mysqlTable("accreditation_indicators",{
  id:id(),
  frameworkId:bigint("framework_id",{mode:"number"}).notNull(),
  criterionId:bigint("criterion_id",{mode:"number"}).notNull(),
  code:varchar("code",{length:100}).notNull(),
  name:varchar("name",{length:700}).notNull(),
  description:text("description"),
  unit:varchar("unit",{length:80}),
  weight:decimal("weight",{precision:10,scale:4}),
  scoringRule:json("scoring_rule"),
  sequence:int("sequence").notNull().default(1),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("accreditation_indicator_framework_code_uq").on(t.frameworkId,t.code)]);

export const accreditationIndicatorVariables=mysqlTable("accreditation_indicator_variables",{
  id:id(),
  indicatorId:bigint("indicator_id",{mode:"number"}).notNull(),
  code:varchar("code",{length:100}).notNull(),
  label:varchar("label",{length:500}).notNull(),
  valueType:varchar("value_type",{length:30}).notNull().default("NUMBER"),
  unit:varchar("unit",{length:80}),
  required:boolean("required").notNull().default(true),
  sourceSubjectType:varchar("source_subject_type",{length:120}),
  sourceField:varchar("source_field",{length:255}),
  defaultValue:varchar("default_value",{length:255}),
  sequence:int("sequence").notNull().default(1),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("accreditation_variable_indicator_code_uq").on(t.indicatorId,t.code)]);

export const accreditationScoringRubrics=mysqlTable("accreditation_scoring_rubrics",{
  id:id(),
  indicatorId:bigint("indicator_id",{mode:"number"}).notNull(),
  score:decimal("score",{precision:10,scale:4}).notNull(),
  label:varchar("label",{length:255}).notNull(),
  description:text("description"),
  conditionRule:json("condition_rule"),
  sequence:int("sequence").notNull().default(1),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
});

export const accreditationIndicatorClusters=mysqlTable("accreditation_indicator_clusters",{
  indicatorId:bigint("indicator_id",{mode:"number"}).notNull(),
  clusterId:bigint("cluster_id",{mode:"number"}).notNull(),
  isPrimary:boolean("is_primary").notNull().default(false),
},t=>[primaryKey({columns:[t.indicatorId,t.clusterId]})]);

export const accreditationEvidenceRequirements=mysqlTable("accreditation_evidence_requirements",{
  id:id(),
  indicatorId:bigint("indicator_id",{mode:"number"}).notNull(),
  code:varchar("code",{length:100}).notNull(),
  description:text("description").notNull(),
  required:boolean("required").notNull().default(true),
  acceptableSubjectTypes:json("acceptable_subject_types"),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
},t=>[uniqueIndex("accreditation_evidence_indicator_code_uq").on(t.indicatorId,t.code)]);

export const studyProgramAccreditationFrameworks=mysqlTable("study_program_accreditation_frameworks",{
  id:id(),
  studyProgramId:bigint("study_program_id",{mode:"number"}).notNull(),
  frameworkId:bigint("framework_id",{mode:"number"}).notNull(),
  isPrimary:boolean("is_primary").notNull().default(true),
  assignmentStatus:varchar("assignment_status",{length:30}).notNull().default("ACTIVE"),
  assignedFrom:date("assigned_from",{mode:"string"}),
  assignedTo:date("assigned_to",{mode:"string"}),
  officialCoverageReference:varchar("official_coverage_reference",{length:1000}),
  notes:text("notes"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("study_program_framework_uq").on(t.studyProgramId,t.frameworkId)]);

export const accreditationIndicatorMandates=mysqlTable("accreditation_indicator_mandates",{
  id:id(),
  assignmentId:bigint("assignment_id",{mode:"number"}).notNull(),
  indicatorId:bigint("indicator_id",{mode:"number"}).notNull(),
  responsibilityScope:varchar("responsibility_scope",{length:30}).notNull(),
  responsibleRole:varchar("responsible_role",{length:100}).notNull(),
  validatorRole:varchar("validator_role",{length:100}).notNull().default("KAJUR"),
  assignedBy:bigint("assigned_by",{mode:"number"}).notNull(),
  status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("accreditation_indicator_mandate_uq").on(t.assignmentId,t.indicatorId)]);

export const accreditationAssessments=mysqlTable("accreditation_assessments",{
  id:id(),
  assignmentId:bigint("assignment_id",{mode:"number"}).notNull(),
  indicatorId:bigint("indicator_id",{mode:"number"}).notNull(),
  period:varchar("period",{length:50}).notNull(),
  readinessStatus:varchar("readiness_status",{length:30}).notNull().default("NOT_ASSESSED"),
  actualValue:varchar("actual_value",{length:255}),
  calculatedValue:varchar("calculated_value",{length:255}),
  calculatedScore:decimal("calculated_score",{precision:10,scale:4}),
  weightedScore:decimal("weighted_score",{precision:14,scale:4}),
  matchedRubricId:bigint("matched_rubric_id",{mode:"number"}),
  calculationSnapshot:json("calculation_snapshot"),
  calculationNote:text("calculation_note"),
  analysis:text("analysis"),
  evaluationNote:text("evaluation_note"),
  ledNote:text("led_note"),
  publicationDecision:varchar("publication_decision",{length:30}).notNull().default("INTERNAL_ONLY"),
  workflowStatus:varchar("workflow_status",{length:30}).notNull().default("DRAFT"),
  assessedBy:bigint("assessed_by",{mode:"number"}).notNull(),
  approvedBy:bigint("approved_by",{mode:"number"}),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("accreditation_assessment_period_uq").on(t.assignmentId,t.indicatorId,t.period)]);

export const accreditationAssessmentValues=mysqlTable("accreditation_assessment_values",{
  id:id(),
  assessmentId:bigint("assessment_id",{mode:"number"}).notNull(),
  variableId:bigint("variable_id",{mode:"number"}).notNull(),
  rawValue:text("raw_value"),
  numericValue:decimal("numeric_value",{precision:20,scale:6}),
  booleanValue:boolean("boolean_value"),
  recordedBy:bigint("recorded_by",{mode:"number"}).notNull(),
  createdAt:timestamp("created_at").defaultNow().notNull(),
  updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("accreditation_assessment_variable_uq").on(t.assessmentId,t.variableId)]);

export const accreditationAssessmentSources=mysqlTable("accreditation_assessment_sources",{
  id:id(),
  assessmentId:bigint("assessment_id",{mode:"number"}).notNull(),
  sourceSubjectType:varchar("source_subject_type",{length:120}).notNull(),
  sourceSubjectId:bigint("source_subject_id",{mode:"number"}),
  referenceTitle:varchar("reference_title",{length:700}).notNull(),
  evidenceId:bigint("evidence_id",{mode:"number"}),
  note:text("note"),
  includeInPublic:boolean("include_in_public").notNull().default(false),
  createdAt:timestamp("created_at").defaultNow().notNull(),
});
