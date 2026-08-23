import { requireDb } from "@/src/db";
import { auditLogs } from "@/src/db/schema";
export async function audit(input:{actorId?:number|null;action:string;subjectType:string;subjectId?:number|null;before?:unknown;after?:unknown;reason?:string}){const db=requireDb();await db.insert(auditLogs).values({actorId:input.actorId??null,action:input.action,subjectType:input.subjectType,subjectId:input.subjectId??null,beforeJson:input.before??null,afterJson:input.after??null,reason:input.reason});}
