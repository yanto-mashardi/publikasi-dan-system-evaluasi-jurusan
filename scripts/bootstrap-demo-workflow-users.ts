import { hash } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { requireDb } from "../src/db";
import { organizations, roles, studyPrograms, userRoles, users } from "../src/db/schema";

async function main(){
 const db=requireDb();
 const[organization]=await db.select().from(organizations).where(eq(organizations.status,"ACTIVE")).limit(1),[program]=await db.select().from(studyPrograms).where(eq(studyPrograms.status,"ACTIVE")).limit(1);
 if(!organization||!program)throw new Error("Jalankan db:seed terlebih dahulu.");
 const demoUsers=[
  {name:`CONTOH - Kaprodi ${program.name}`,email:process.env.DEMO_KAPRODI_EMAIL??"kaprodi.prodi@local.test",password:process.env.DEMO_KAPRODI_PASSWORD??"Kaprodi123!",roleCode:"KAPRODI",studyProgramId:program.id},
  {name:`CONTOH - Ketua ${organization.name}`,email:process.env.DEMO_KAJUR_EMAIL??"kajur@local.test",password:process.env.DEMO_KAJUR_PASSWORD??"Kajur123!",roleCode:"KAJUR",studyProgramId:null},
  {name:`CONTOH - GKM ${organization.name}`,email:process.env.DEMO_GKM_EMAIL??"gkm@local.test",password:process.env.DEMO_GKM_PASSWORD??"GkmMutu123!",roleCode:"GKM",studyProgramId:null},
  {name:`CONTOH - Sekretaris ${organization.name}`,email:process.env.DEMO_SEKJUR_EMAIL??"sekjur@local.test",password:process.env.DEMO_SEKJUR_PASSWORD??"Sekjur123!",roleCode:"SEKJUR",studyProgramId:null},
  {name:`CONTOH - Viewer ${organization.name}`,email:process.env.DEMO_VIEWER_EMAIL??"viewer@local.test",password:process.env.DEMO_VIEWER_PASSWORD??"Viewer123!",roleCode:"VIEWER_INTERNAL",studyProgramId:null},
 ];
 for(const item of demoUsers){
  const[role]=await db.select().from(roles).where(eq(roles.code,item.roleCode)).limit(1);if(!role)throw new Error(`Role ${item.roleCode} belum tersedia.`);
  let[user]=await db.select({id:users.id,name:users.name,email:users.email,passwordHash:users.passwordHash,status:users.status,createdAt:users.createdAt}).from(userRoles).innerJoin(users,eq(userRoles.userId,users.id)).where(and(eq(userRoles.roleId,role.id),eq(userRoles.organizationId,organization.id))).limit(1);
  if(!user)[user]=await db.select().from(users).where(eq(users.email,item.email)).limit(1);
  const passwordHash=await hash(item.password,12);
  if(!user){const result=await db.insert(users).values({name:item.name,email:item.email,passwordHash,status:"ACTIVE"});[user]=await db.select().from(users).where(eq(users.id,Number(result[0].insertId))).limit(1);}else await db.update(users).set({name:item.name,passwordHash,status:"ACTIVE"}).where(eq(users.id,user.id));
  await db.insert(userRoles).values({userId:user.id,roleId:role.id,organizationId:organization.id,studyProgramId:item.studyProgramId}).onDuplicateKeyUpdate({set:{roleId:role.id,organizationId:organization.id,studyProgramId:item.studyProgramId}});
  console.log(`${item.roleCode}: ${user.email} / ${item.password}`);
 }
}
main().then(()=>process.exit(0)).catch(error=>{console.error(error);process.exit(1)});
