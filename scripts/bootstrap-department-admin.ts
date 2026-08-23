import { hash } from "bcryptjs";
import { and, eq } from "drizzle-orm";
import { requireDb } from "../src/db";
import { organizations, roles, userRoles, users } from "../src/db/schema";

async function main() {
  const email = process.env.DEMO_DEPARTMENT_ADMIN_EMAIL ?? "admin.jurusan@local.test";
  const password = process.env.DEMO_DEPARTMENT_ADMIN_PASSWORD ?? "AdminJurusan123!";
  const db = requireDb();
  const [org] = await db.select().from(organizations).where(eq(organizations.status, "ACTIVE")).limit(1);
  const [role] = await db.select().from(roles).where(eq(roles.code, "ADMIN_DATA")).limit(1);
  if (!org || !role) throw new Error("Jalankan db:seed terlebih dahulu.");
  let [user] = await db.select({id:users.id,name:users.name,email:users.email,passwordHash:users.passwordHash,status:users.status,createdAt:users.createdAt}).from(userRoles).innerJoin(users,eq(userRoles.userId,users.id)).where(and(eq(userRoles.roleId,role.id),eq(userRoles.organizationId,org.id))).limit(1);
  if(!user)[user]=await db.select().from(users).where(eq(users.email, email)).limit(1);
  const passwordHash = await hash(password, 12);
  const name = `Admin ${org.name}`;
  if (!user) {
    const result = await db.insert(users).values({ name, email, passwordHash });
    [user] = await db.select().from(users).where(eq(users.id, Number(result[0].insertId))).limit(1);
  } else {
    await db.update(users).set({ name, passwordHash, status: "ACTIVE" }).where(eq(users.id, user.id));
  }
  await db.insert(userRoles).values({ userId: user.id, roleId: role.id, organizationId: org.id, studyProgramId: null }).onDuplicateKeyUpdate({ set: { roleId: role.id, organizationId: org.id, studyProgramId: null } });
  console.log(`Admin Jurusan siap: ${email}`);
}
main().then(() => process.exit(0)).catch(error => { console.error(error); process.exit(1); });
