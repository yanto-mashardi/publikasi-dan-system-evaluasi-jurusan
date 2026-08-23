import { and, eq } from "drizzle-orm";
import { requireDb } from "../src/db";
import { organizations,permissions,publicationPolicies,rolePermissions,roles,studyPrograms } from "../src/db/schema";
import { roleSettings } from "../src/db/schema-admin";

const ROLE_NAMES:Record<string,string>={ADMIN_SYSTEM:"Admin Sistem",ADMIN_DATA:"Admin Jurusan",KAPRODI:"Kaprodi",GKM:"GKM",SEKJUR:"Sekjur",KAJUR:"Kajur",VIEWER_INTERNAL:"Viewer Internal"};
const PERMISSIONS=["system.configure","users.manage","roles.manage","master.manage","audit.read","data.create","data.update","evidence.upload","publication.execute","news.manage","program.read","program.update","curriculum.manage","kpi.measure","followup.execute","quality.read","evidence.verify","evaluation.create","finding.create","recommendation.create","followup.verify","publication.recommend","data.verify","workflow.coordinate","publication.review","approval.final","evaluation.approve","publication.approve","report.approve","internal.read","resources.read","resources.manage","resources.contribute","accreditation.read","accreditation.framework.manage","accreditation.assign","accreditation.assess","accreditation.approve","accreditation.publish"];
const ROLE_GRANTS:Record<string,string[]>={
 ADMIN_SYSTEM:PERMISSIONS,
 ADMIN_DATA:["data.create","data.update","evidence.upload","publication.execute","news.manage","program.read","program.update","curriculum.manage","kpi.measure","evaluation.create","finding.create","recommendation.create","followup.execute","internal.read","resources.read","resources.manage","resources.contribute","accreditation.read","accreditation.assess"],
 KAPRODI:["program.read","program.update","curriculum.manage","kpi.measure","evidence.upload","followup.execute","internal.read","resources.read","resources.contribute","accreditation.read"],
 GKM:["quality.read","evidence.verify","evaluation.create","finding.create","recommendation.create","followup.verify","publication.recommend","internal.read","resources.read","accreditation.read","accreditation.assess"],
 SEKJUR:["data.verify","workflow.coordinate","publication.review","followup.verify","internal.read","resources.read","resources.manage","accreditation.read"],
 KAJUR:["approval.final","evaluation.approve","publication.approve","report.approve","internal.read","resources.read","accreditation.read","accreditation.approve","accreditation.publish"],
 VIEWER_INTERNAL:["internal.read","resources.read","accreditation.read"]
};
const POLICIES=[
 {subjectType:"STRATEGIC_STATEMENT",requiredLifecycleStatus:"EFFECTIVE",allowedFields:["statementType","statement","versionNumber","effectiveFrom","studyProgramId"]},
 {subjectType:"KPI_MEASUREMENT",requiredLifecycleStatus:"APPROVED",allowedFields:["kpi","period","targetValue","actualValue","achievementPercent","status","publicSummary"]},
 {subjectType:"EVALUATION",requiredLifecycleStatus:"APPROVED",allowedFields:["subject","period","publicSummary","recommendationSummary","followupProgress"]},
 {subjectType:"NEWS_ARTICLE",requiredLifecycleStatus:"APPROVED",allowedFields:["title","slug","excerpt","body","coverImageUrl","category","featured","publishedAt"]},
 {subjectType:"CURRICULUM",requiredLifecycleStatus:"EFFECTIVE",allowedFields:["studyProgram","code","title","versionNumber","academicYearStart","academicYearEnd","totalCredits","description","graduateProfiles","cpl","courses","evaluationHistory"]},
 {subjectType:"LABORATORY_PROFILE",requiredLifecycleStatus:"APPROVED",allowedFields:["code","name","description","location","operationalStatus","studyPrograms","equipmentSummary"]},
 {subjectType:"RESEARCH_PROJECT",requiredLifecycleStatus:"APPROVED",allowedFields:["studyProgram","title","year","fundingSource","scheme","outputSummary","projectStatus"]},
 {subjectType:"COMMUNITY_SERVICE_PROJECT",requiredLifecycleStatus:"APPROVED",allowedFields:["studyProgram","title","year","partner","fundingSource","outputSummary","projectStatus"]},
 {subjectType:"STUDENT_ANNUAL_STAT",requiredLifecycleStatus:"APPROVED",allowedFields:["studyProgram","academicYear","activeStudents","newStudents","graduates","dropoutStudents"]},
 {subjectType:"GRADUATE_OUTCOME_STAT",requiredLifecycleStatus:"APPROVED",allowedFields:["studyProgram","graduationYear","graduates","trackedGraduates","employed","entrepreneurship","furtherStudy","averageWaitingMonths","relevantEmploymentPercent"]},
 {subjectType:"COOPERATION",requiredLifecycleStatus:"APPROVED",allowedFields:["studyProgram","partnerName","partnerType","scope","startDate","endDate","implementationSummary","cooperationStatus"]}
];

async function main(){
 const db=requireDb();
 let[org]=await db.select().from(organizations).where(eq(organizations.code,"KEMARITIMAN")).limit(1);
 if(!org){const x=await db.insert(organizations).values({type:"UPPS",code:"KEMARITIMAN",name:"Jurusan Kemaritiman"});[org]=await db.select().from(organizations).where(eq(organizations.id,Number(x[0].insertId))).limit(1);}
 for(const code of PERMISSIONS){const[found]=await db.select().from(permissions).where(eq(permissions.code,code)).limit(1);if(!found)await db.insert(permissions).values({code,name:code});}
 for(const[code,name]of Object.entries(ROLE_NAMES)){
   let[role]=await db.select().from(roles).where(eq(roles.code,code)).limit(1);
   if(!role){const x=await db.insert(roles).values({code,name});[role]=await db.select().from(roles).where(eq(roles.id,Number(x[0].insertId))).limit(1);}else if(role.name!==name)await db.update(roles).set({name}).where(eq(roles.id,role.id));
   const[setting]=await db.select().from(roleSettings).where(eq(roleSettings.roleId,role.id)).limit(1);if(!setting)await db.insert(roleSettings).values({roleId:role.id,status:"ACTIVE",isSystemRole:true});
   await db.delete(rolePermissions).where(eq(rolePermissions.roleId,role.id));
   for(const permissionCode of ROLE_GRANTS[code]??[]){const[perm]=await db.select().from(permissions).where(eq(permissions.code,permissionCode)).limit(1);if(perm)await db.insert(rolePermissions).values({roleId:role.id,permissionId:perm.id});}
 }
 for(const program of[{code:"D3-NAUTIKA",name:"D3 Nautika"},{code:"D3-KPN",name:"D3 Ketatalaksanaan Pelayaran Niaga"}]){const[found]=await db.select().from(studyPrograms).where(eq(studyPrograms.code,program.code)).limit(1);if(!found)await db.insert(studyPrograms).values({organizationId:org.id,level:"D3",...program});}
 for(const p of POLICIES){const[found]=await db.select().from(publicationPolicies).where(and(eq(publicationPolicies.subjectType,p.subjectType),eq(publicationPolicies.status,"ACTIVE"))).limit(1);if(!found)await db.insert(publicationPolicies).values({subjectType:p.subjectType,policyVersion:1,allowedFields:p.allowedFields,requiredLifecycleStatus:p.requiredLifecycleStatus,requiresApproval:true,status:"ACTIVE"});else await db.update(publicationPolicies).set({allowedFields:p.allowedFields,requiredLifecycleStatus:p.requiredLifecycleStatus,requiresApproval:true}).where(eq(publicationPolicies.id,found.id));}
 console.log("Foundation seed selesai.");
}
main().then(()=>process.exit(0)).catch(e=>{console.error(e);process.exit(1)});
