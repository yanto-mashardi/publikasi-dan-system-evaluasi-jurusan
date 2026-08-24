import {eq} from "drizzle-orm";
import {NextResponse} from "next/server";
import {requireDb} from "@/src/db";
import {evaluationModules} from "@/src/db/schema-evaluation-modules";
import {getSession} from "@/src/lib/auth";
import {can} from "@/src/lib/rbac";
export async function GET(){const session=await getSession();if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});if(!can(session,"accreditation.read"))return NextResponse.json({error:"Forbidden"},{status:403});return NextResponse.json(await requireDb().select().from(evaluationModules).where(eq(evaluationModules.status,"ACTIVE")));}
