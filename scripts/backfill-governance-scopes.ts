import { and,eq } from "drizzle-orm";
import { requireDb } from "../src/db";
import { kpis,strategicGoals,strategicPlans,strategicStatements } from "../src/db/schema";
import { governanceScopes } from "../src/db/schema-phase5";

async function ensure(subjectType:string,subjectId:number,organizationId:number){const db=requireDb();const[found]=await db.select({id:governanceScopes.id}).from(governanceScopes).where(and(eq(governanceScopes.subjectType,subjectType),eq(governanceScopes.subjectId,subjectId))).limit(1);if(!found)await db.insert(governanceScopes).values({subjectType,subjectId,organizationId,studyProgramId:null});}
async function main(){const db=requireDb();for(const x of await db.select().from(strategicPlans))await ensure("STRATEGIC_PLAN",x.id,x.organizationId);for(const x of await db.select().from(strategicStatements))await ensure("STRATEGIC_STATEMENT",x.id,x.organizationId);for(const x of await db.select().from(strategicGoals))await ensure("STRATEGIC_GOAL",x.id,x.organizationId);for(const x of await db.select().from(kpis))await ensure("KPI",x.id,x.ownerOrganizationId);console.log("Governance scope backfill selesai.");}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
