import { requireDb } from "../src/db";
import { organizations,roles,studyPrograms,userRoles,users } from "../src/db/schema";
import { federatedApplications } from "../src/db/schema-admin";
import { accreditationAgencies,accreditationAssessmentValues,accreditationAssessments,accreditationCriteria,accreditationEvidenceRequirements,accreditationFrameworks,accreditationIndicators,accreditationIndicatorVariables,accreditationScoringRubrics,studyProgramAccreditationFrameworks } from "../src/db/schema-accreditation";
type Problem={relation:string;count:number};
function missing<T extends Record<string,any>>(rows:T[],foreignKey:keyof T,parents:Set<number>){return rows.filter(row=>row[foreignKey]!=null&&!parents.has(Number(row[foreignKey]))).length;}
async function main(){const db=requireDb();const[orgs,programs,userRows,roleRows,grants,agencies,frameworks,criteria,indicators,variables,rubrics,evidence,assignments,assessments,values,federated]=await Promise.all([db.select().from(organizations),db.select().from(studyPrograms),db.select().from(users),db.select().from(roles),db.select().from(userRoles),db.select().from(accreditationAgencies),db.select().from(accreditationFrameworks),db.select().from(accreditationCriteria),db.select().from(accreditationIndicators),db.select().from(accreditationIndicatorVariables),db.select().from(accreditationScoringRubrics),db.select().from(accreditationEvidenceRequirements),db.select().from(studyProgramAccreditationFrameworks),db.select().from(accreditationAssessments),db.select().from(accreditationAssessmentValues),db.select().from(federatedApplications)]);const ids=(rows:Array<{id:number}>)=>new Set(rows.map(row=>row.id)),problems:Problem[]=[
 {relation:"study_programs.organization_id",count:missing(programs,"organizationId",ids(orgs))},
 {relation:"user_roles.user_id",count:missing(grants,"userId",ids(userRows))},
 {relation:"user_roles.role_id",count:missing(grants,"roleId",ids(roleRows))},
 {relation:"user_roles.organization_id",count:missing(grants,"organizationId",ids(orgs))},
 {relation:"frameworks.agency_id",count:missing(frameworks,"agencyId",ids(agencies))},
 {relation:"criteria.framework_id",count:missing(criteria,"frameworkId",ids(frameworks))},
 {relation:"indicators.framework_id",count:missing(indicators,"frameworkId",ids(frameworks))},
 {relation:"indicators.criterion_id",count:missing(indicators,"criterionId",ids(criteria))},
 {relation:"variables.indicator_id",count:missing(variables,"indicatorId",ids(indicators))},
 {relation:"rubrics.indicator_id",count:missing(rubrics,"indicatorId",ids(indicators))},
 {relation:"evidence.indicator_id",count:missing(evidence,"indicatorId",ids(indicators))},
 {relation:"assignments.study_program_id",count:missing(assignments,"studyProgramId",ids(programs))},
 {relation:"assignments.framework_id",count:missing(assignments,"frameworkId",ids(frameworks))},
 {relation:"assessments.assignment_id",count:missing(assessments,"assignmentId",ids(assignments))},
 {relation:"assessments.indicator_id",count:missing(assessments,"indicatorId",ids(indicators))},
 {relation:"assessment_values.assessment_id",count:missing(values,"assessmentId",ids(assessments))},
 {relation:"assessment_values.variable_id",count:missing(values,"variableId",ids(variables))},
 ];const orphaned=problems.filter(problem=>problem.count>0);console.log(JSON.stringify({status:orphaned.length?"PROBLEMS_FOUND":"CLEAN",counts:{organizations:orgs.length,activeOrganizations:orgs.filter(row=>row.status==="ACTIVE").length,studyPrograms:programs.length,users:userRows.length,roles:roleRows.length,frameworks:frameworks.length,indicators:indicators.length,variables:variables.length,rubrics:rubrics.length,assessments:assessments.length,federatedApplications:federated.length},orphanedRelations:orphaned},null,2));if(orphaned.length)process.exitCode=1;}
main().catch(error=>{console.error(error);process.exit(1)});
