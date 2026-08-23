import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { evidences } from "@/src/db/schema";
import { getSession } from "@/src/lib/auth";
import { audit } from "@/src/lib/audit";
import { can } from "@/src/lib/rbac";
import { storeEvidence } from "@/src/lib/storage";
const meta=z.object({subjectType:z.string().min(2),subjectId:z.coerce.number().int().positive(),title:z.string().min(2)});
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!(can(s,"evidence.upload")||can(s,"data.create")))return NextResponse.json({error:"Forbidden"},{status:403});const form=await req.formData();const parsed=meta.safeParse({subjectType:form.get("subjectType"),subjectId:form.get("subjectId"),title:form.get("title")});const file=form.get("file");if(!parsed.success||!(file instanceof File))return NextResponse.json({error:"Metadata/file tidak valid."},{status:400});const stored=await storeEvidence(file);const db=requireDb();const r=await db.insert(evidences).values({...parsed.data,...stored,visibility:"INTERNAL",uploadedBy:s.userId});const id=Number(r[0].insertId);await audit({actorId:s.userId,action:"UPLOAD_EVIDENCE",subjectType:parsed.data.subjectType,subjectId:parsed.data.subjectId,after:{evidenceId:id,title:parsed.data.title,checksum:stored.checksum}});return NextResponse.json({id,...stored},{status:201});}
