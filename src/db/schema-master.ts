import { bigint,json,mysqlTable,text,timestamp,uniqueIndex,varchar } from "drizzle-orm/mysql-core";

const id=(name="id")=>bigint(name,{mode:"number"}).autoincrement().primaryKey();

export const tenantApplications=mysqlTable("master_tenant_applications",{
  id:id(),code:varchar("code",{length:80}).notNull(),name:varchar("name",{length:255}).notNull(),
  domain:varchar("domain",{length:700}).notNull(),databaseName:varchar("database_name",{length:120}).notNull(),
  organizationType:varchar("organization_type",{length:50}).notNull().default("UPPS"),
  deploymentStatus:varchar("deployment_status",{length:40}).notNull().default("REQUESTED"),
  healthStatus:varchar("health_status",{length:30}).notNull().default("NOT_CHECKED"),
  templateVersion:varchar("template_version",{length:80}),lastError:text("last_error"),encryptedFederationToken:text("encrypted_federation_token"),
  configuration:json("configuration"),lastHealthAt:timestamp("last_health_at"),lastSyncAt:timestamp("last_sync_at"),
  federationSnapshot:json("federation_snapshot"),status:varchar("status",{length:30}).notNull().default("ACTIVE"),
  createdAt:timestamp("created_at").defaultNow().notNull(),updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("master_tenant_code_uq").on(t.code),uniqueIndex("master_tenant_domain_uq").on(t.domain),uniqueIndex("master_tenant_database_uq").on(t.databaseName)]);

export const tenantProvisioningJobs=mysqlTable("master_tenant_provisioning_jobs",{
  id:id(),tenantId:bigint("tenant_id",{mode:"number"}).notNull(),action:varchar("action",{length:50}).notNull(),
  status:varchar("status",{length:30}).notNull().default("PENDING"),requestSnapshot:json("request_snapshot"),resultSnapshot:json("result_snapshot"),
  errorMessage:text("error_message"),requestedBy:bigint("requested_by",{mode:"number"}).notNull(),
  startedAt:timestamp("started_at"),finishedAt:timestamp("finished_at"),createdAt:timestamp("created_at").defaultNow().notNull(),
});

export const tenantTemplateDistributions=mysqlTable("master_tenant_template_distributions",{
  id:id(),tenantId:bigint("tenant_id",{mode:"number"}).notNull(),studyProgramCode:varchar("study_program_code",{length:80}).notNull(),
  agencyCode:varchar("agency_code",{length:80}).notNull(),frameworkCode:varchar("framework_code",{length:120}).notNull(),frameworkVersion:varchar("framework_version",{length:40}).notNull(),
  payloadChecksum:varchar("payload_checksum",{length:128}),distributionStatus:varchar("distribution_status",{length:30}).notNull().default("PENDING"),
  distributedAt:timestamp("distributed_at"),lastError:text("last_error"),createdAt:timestamp("created_at").defaultNow().notNull(),updatedAt:timestamp("updated_at").defaultNow().notNull(),
},t=>[uniqueIndex("master_tenant_template_distribution_uq").on(t.tenantId,t.studyProgramCode,t.agencyCode,t.frameworkCode,t.frameworkVersion)]);
