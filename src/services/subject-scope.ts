import { eq } from "drizzle-orm";
import { requireDb } from "@/src/db";
import { evaluations,followups,kpiMeasurements,kpis,recommendations,strategicGoals,strategicPlans,strategicStatements,studyPrograms } from "@/src/db/schema";
import { newsArticles } from "@/src/db/schema-admin";
import { cpl,cpmk,courses,curricula,curriculumCourses } from "@/src/db/schema-phase5";
import type { SessionUser } from "@/src/lib/auth";
import { scopeAllows } from "@/src/lib/rbac";
import { getGovernanceScope } from "@/src/services/governance-scope";

export type SubjectScope={organizationId:number;studyProgramId:number|null};
async function programScope(studyProgramId:number):Promise<SubjectScope|null>{const db=requireDb();const[p]=await db.select({organizationId:studyPrograms.organizationId}).from(studyPrograms).where(eq(studyPrograms.id,studyProgramId)).limit(1);return p?{organizationId:p.organizationId,studyProgramId}:null;}

export async function resolveSubjectScope(subjectType:string,subjectId:number,depth=0):Promise<SubjectScope|null>{
 if(depth>5)return null;const db=requireDb();
 if(["STRATEGIC_PLAN","STRATEGIC_STATEMENT","STRATEGIC_GOAL","KPI"].includes(subjectType)){const gs=await getGovernanceScope(subjectType,subjectId);if(gs)return{organizationId:gs.organizationId,studyProgramId:gs.studyProgramId??null};if(subjectType==="STRATEGIC_PLAN"){const[x]=await db.select({organizationId:strategicPlans.organizationId}).from(strategicPlans).where(eq(strategicPlans.id,subjectId)).limit(1);return x?{organizationId:x.organizationId,studyProgramId:null}:null;}if(subjectType==="STRATEGIC_STATEMENT"){const[x]=await db.select({organizationId:strategicStatements.organizationId}).from(strategicStatements).where(eq(strategicStatements.id,subjectId)).limit(1);return x?{organizationId:x.organizationId,studyProgramId:null}:null;}if(subjectType==="STRATEGIC_GOAL"){const[x]=await db.select({organizationId:strategicGoals.organizationId}).from(strategicGoals).where(eq(strategicGoals.id,subjectId)).limit(1);return x?{organizationId:x.organizationId,studyProgramId:null}:null;}const[x]=await db.select({organizationId:kpis.ownerOrganizationId}).from(kpis).where(eq(kpis.id,subjectId)).limit(1);return x?{organizationId:x.organizationId,studyProgramId:null}:null;}
 if(subjectType==="KPI_MEASUREMENT"){const[x]=await db.select({kpiId:kpiMeasurements.kpiId}).from(kpiMeasurements).where(eq(kpiMeasurements.id,subjectId)).limit(1);return x?resolveSubjectScope("KPI",x.kpiId,depth+1):null;}
 if(subjectType==="CURRICULUM"){const[x]=await db.select({studyProgramId:curricula.studyProgramId}).from(curricula).where(eq(curricula.id,subjectId)).limit(1);return x?programScope(x.studyProgramId):null;}
 if(subjectType==="COURSE"){const[x]=await db.select({studyProgramId:courses.studyProgramId}).from(courses).where(eq(courses.id,subjectId)).limit(1);return x?programScope(x.studyProgramId):null;}
 if(subjectType==="CPL"){const[x]=await db.select({curriculumId:cpl.curriculumId}).from(cpl).where(eq(cpl.id,subjectId)).limit(1);return x?resolveSubjectScope("CURRICULUM",x.curriculumId,depth+1):null;}
 if(subjectType==="CPMK"){const[x]=await db.select({curriculumCourseId:cpmk.curriculumCourseId}).from(cpmk).where(eq(cpmk.id,subjectId)).limit(1);if(!x)return null;const[cc]=await db.select({curriculumId:curriculumCourses.curriculumId}).from(curriculumCourses).where(eq(curriculumCourses.id,x.curriculumCourseId)).limit(1);return cc?resolveSubjectScope("CURRICULUM",cc.curriculumId,depth+1):null;}
 if(subjectType==="NEWS_ARTICLE"){const[x]=await db.select({organizationId:newsArticles.organizationId}).from(newsArticles).where(eq(newsArticles.id,subjectId)).limit(1);return x?{organizationId:x.organizationId,studyProgramId:null}:null;}
 if(subjectType==="EVALUATION"){const[x]=await db.select({subjectType:evaluations.subjectType,subjectId:evaluations.subjectId}).from(evaluations).where(eq(evaluations.id,subjectId)).limit(1);return x?resolveSubjectScope(x.subjectType,x.subjectId,depth+1):null;}
 if(subjectType==="FOLLOWUP"){const[x]=await db.select({recommendationId:followups.recommendationId}).from(followups).where(eq(followups.id,subjectId)).limit(1);if(!x)return null;const[r]=await db.select({evaluationId:recommendations.evaluationId}).from(recommendations).where(eq(recommendations.id,x.recommendationId)).limit(1);return r?resolveSubjectScope("EVALUATION",r.evaluationId,depth+1):null;}
 return null;
}
export async function subjectScopeAllows(user:SessionUser,subjectType:string,subjectId:number){const scope=await resolveSubjectScope(subjectType,subjectId);return !!scope&&scopeAllows(user,scope.organizationId,scope.studyProgramId);}
