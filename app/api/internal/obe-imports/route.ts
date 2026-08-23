import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";
import { requireDb } from "@/src/db";
import { obeImports } from "@/src/db/schema-phase5";
import { getSession } from "@/src/lib/auth";
import { can } from "@/src/lib/rbac";
import { audit } from "@/src/lib/audit";
import { canAccessProgram } from "@/src/services/academic-scope";
const input=z.object({studyProgramId:z.number().int().positive(),sourceType:z.enum(["GOOGLE_SHEET","CSV","JSON","MANUAL"]),sourceReference:z.string().max(1000).optional(),summary:z.record(z.string(),z.unknown()).optional()});
export async function GET(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});const studyProgramId=Number(new URL(req.url).searchParams.get("studyProgramId"));if(!studyProgramId||!(await canAccessProgram(s,studyProgramId)))return NextResponse.json({error:"Scope Program Studi tidak sesuai."},{status:403});const db=requireDb();return NextResponse.json(await db.select().from(obeImports).where(eq(obeImports.studyProgramId,studyProgramId)));}
export async function POST(req:Request){const s=await getSession();if(!s)return NextResponse.json({error:"Unauthorized"},{status:401});if(!(can(s,"curriculum.manage")||can(s,"data.create")))return NextResponse.json({error:"Forbidden"},{status:403});const p=input.safeParse(await req.json());if(!p.success)return NextResponse.json({error:p.error.flatten()},{status:400});if(!(await canAccessProgram(s,p.data.studyProgramId)))return NextResponse.json({error:"Scope Program Studi tidak sesuai."},{status:403});const db=requireDb();const x=await db.insert(obeImports).values({...p.data,summary:p.data.summary??{},importedBy:s.userId,status:"STAGED"});const id=Number(x[0].insertId);await audit({actorId:s.userId,action:"STAGE_OBE_IMPORT",subjectType:"OBE_IMPORT",subjectId:id,after:p.data});return NextResponse.json({id,status:"STAGED",note:"Import staging tidak menimpa kurikulum. Transformasi ke CPL/CPMK dilakukan setelah mapping dan validasi."},{status:201});}
