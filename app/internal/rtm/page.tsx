import {eq} from "drizzle-orm";
import {redirect} from "next/navigation";
import {requireDb} from "@/src/db";
import {organizations} from "@/src/db/schema";
import {evaluationPeriods} from "@/src/db/schema-evaluation-modules";
import {getSession} from "@/src/lib/auth";
import {can,hasRole,scopeAllows} from "@/src/lib/rbac";
import RtmConsole from "./RtmConsole";
import "./rtm.css";

export const dynamic="force-dynamic";
export default async function RtmPage(){const session=await getSession();if(!session)redirect("/internal/login");if(!can(session,"accreditation.read"))redirect("/internal");const db=requireDb(),orgRows=await db.select().from(organizations).where(eq(organizations.status,"ACTIVE")),scoped=orgRows.filter(row=>scopeAllows(session,row.id,null)),orgIds=new Set(scoped.map(row=>row.id)),periods=(await db.select().from(evaluationPeriods)).filter(row=>orgIds.has(row.organizationId));return <RtmConsole organizations={scoped} periods={periods} canManage={hasRole(session,"ADMIN_DATA")||hasRole(session,"KAJUR")||hasRole(session,"ADMIN_SYSTEM")} canApprove={hasRole(session,"KAJUR")||hasRole(session,"ADMIN_SYSTEM")}/>;}
