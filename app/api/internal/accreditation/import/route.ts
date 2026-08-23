import ExcelJS from "exceljs";
import { and,eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { requireDb } from "@/src/db";
import { accreditationClusters,accreditationCriteria,accreditationEvidenceRequirements,accreditationFrameworks,accreditationIndicatorClusters,accreditationIndicators,accreditationIndicatorVariables,accreditationScoringRubrics } from "@/src/db/schema-accreditation";
import { getSession } from "@/src/lib/auth";
import { audit } from "@/src/lib/audit";
import { can } from "@/src/lib/rbac";

const headers=["cluster_code","cluster_name","semantic_group","criterion_code","criterion_name","indicator_code","indicator_name","indicator_description","unit","weight","variable_code","variable_label","variable_type","variable_unit","rubric_score","rubric_label","rubric_condition_json","evidence_code","evidence_description","evidence_subject_types"];
const required=headers.slice(0,7);
const textValue=(value:ExcelJS.CellValue)=>value==null?"":typeof value==="object"&&"text" in value?String(value.text):String(value).trim();

export async function GET(){
  const session=await getSession();
  if(!session||!can(session,"accreditation.framework.manage"))return NextResponse.json({error:"Forbidden"},{status:403});
  const workbook=new ExcelJS.Workbook();
  const sheet=workbook.addWorksheet("INDIKATOR");
  sheet.addRow(headers);
  sheet.addRow(["INPUT","Masukan","INPUT","K1","Visi, Misi, Tujuan dan Strategi","K1-I1","Kesesuaian VMTS","Uraian indikator resmi","%",1,"NILAI_KESESUAIAN","Nilai kesesuaian","NUMBER","%",4,"Sangat sesuai",'{"variable":"$RESULT","operator":"GTE","value":80}',"EV-01","Dokumen VMTS","VMTS_DOCUMENT"]);
  sheet.getRow(1).font={bold:true};
  sheet.views=[{state:"frozen",ySplit:1}];
  sheet.columns=headers.map(key=>({key,width:Math.max(16,key.length+2)}));
  const buffer=await workbook.xlsx.writeBuffer();
  return new NextResponse(buffer as ArrayBuffer,{headers:{"content-type":"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet","content-disposition":'attachment; filename="template-indikator-lam.xlsx"'}});
}

export async function POST(req:Request){
  const session=await getSession();
  if(!session)return NextResponse.json({error:"Unauthorized"},{status:401});
  if(!can(session,"accreditation.framework.manage"))return NextResponse.json({error:"Hanya Super Admin yang dapat mengimpor template global."},{status:403});
  const form=await req.formData();
  const frameworkId=Number(form.get("frameworkId"));
  const file=form.get("file");
  if(!Number.isInteger(frameworkId)||frameworkId<1||!(file instanceof File))return NextResponse.json({error:"Framework dan file Excel wajib dipilih."},{status:400});
  if(file.size>5*1024*1024||!file.name.toLowerCase().endsWith(".xlsx"))return NextResponse.json({error:"Gunakan file .xlsx maksimal 5 MB."},{status:400});
  const db=requireDb();
  const[framework]=await db.select().from(accreditationFrameworks).where(eq(accreditationFrameworks.id,frameworkId)).limit(1);
  if(!framework)return NextResponse.json({error:"Framework tidak ditemukan."},{status:404});
  if(framework.lifecycleStatus!=="DRAFT")return NextResponse.json({error:"Excel hanya dapat diimpor ke framework DRAFT. Buat versi baru untuk mengganti instrumen aktif."},{status:409});
  const existing=await db.select({id:accreditationIndicators.id}).from(accreditationIndicators).where(eq(accreditationIndicators.frameworkId,frameworkId)).limit(1);
  if(existing.length)return NextResponse.json({error:"Framework DRAFT ini sudah berisi indikator. Gunakan DRAFT baru agar impor tidak menimpa data."},{status:409});

  const workbook=new ExcelJS.Workbook();
  try{await workbook.xlsx.load(await file.arrayBuffer());}catch{return NextResponse.json({error:"File Excel tidak dapat dibaca."},{status:400});}
  const sheet=workbook.getWorksheet("INDIKATOR")??workbook.worksheets[0];
  if(!sheet)return NextResponse.json({error:"Sheet INDIKATOR tidak ditemukan."},{status:400});
  const headerMap=new Map<string,number>();
  sheet.getRow(1).eachCell((cell,column)=>headerMap.set(textValue(cell.value).toLowerCase(),column));
  const missing=required.filter(name=>!headerMap.has(name));
  if(missing.length)return NextResponse.json({error:`Kolom wajib belum tersedia: ${missing.join(", ")}`},{status:400});
  const rows:Record<string,string>[]=[];
  for(let index=2;index<=sheet.rowCount;index++){
    const row:Record<string,string>={};
    for(const name of headers)row[name]=textValue(sheet.getRow(index).getCell(headerMap.get(name)??0).value);
    if(Object.values(row).every(value=>!value))continue;
    const absent=required.filter(name=>!row[name]);
    if(absent.length)return NextResponse.json({error:`Baris ${index}: kolom wajib kosong (${absent.join(", ")}).`},{status:400});
    if(!["INPUT","PROCESS","OUTPUT_OUTCOME"].includes(row.semantic_group))return NextResponse.json({error:`Baris ${index}: semantic_group harus INPUT, PROCESS, atau OUTPUT_OUTCOME.`},{status:400});
    rows.push(row);
  }
  if(!rows.length)return NextResponse.json({error:"Excel tidak memiliki baris indikator."},{status:400});

  const counts={clusters:0,criteria:0,indicators:0,variables:0,rubrics:0,evidence:0};
  await db.transaction(async tx=>{
    const clusters=new Map<string,number>(),criteria=new Map<string,number>(),indicators=new Map<string,number>();
    for(const [sequence,row] of rows.entries()){
      let clusterId=clusters.get(row.cluster_code);
      if(!clusterId){const result=await tx.insert(accreditationClusters).values({frameworkId,code:row.cluster_code,name:row.cluster_name,semanticGroup:row.semantic_group,sequence:sequence+1,status:"ACTIVE"});clusterId=Number(result[0].insertId);clusters.set(row.cluster_code,clusterId);counts.clusters++;}
      let criterionId=criteria.get(row.criterion_code);
      if(!criterionId){const result=await tx.insert(accreditationCriteria).values({frameworkId,code:row.criterion_code,name:row.criterion_name,sequence:sequence+1,status:"ACTIVE"});criterionId=Number(result[0].insertId);criteria.set(row.criterion_code,criterionId);counts.criteria++;}
      let indicatorId=indicators.get(row.indicator_code);
      if(!indicatorId){const weight=row.weight?Number(row.weight):undefined;if(row.weight&&!Number.isFinite(weight))throw new Error(`Bobot indikator ${row.indicator_code} tidak valid.`);const result=await tx.insert(accreditationIndicators).values({frameworkId,criterionId,code:row.indicator_code,name:row.indicator_name,description:row.indicator_description||undefined,unit:row.unit||undefined,weight:weight==null?undefined:String(weight),sequence:sequence+1,status:"ACTIVE"});indicatorId=Number(result[0].insertId);indicators.set(row.indicator_code,indicatorId);await tx.insert(accreditationIndicatorClusters).values({indicatorId,clusterId,isPrimary:true});counts.indicators++;}
      if(row.variable_code){if(!row.variable_label)throw new Error(`Label variabel ${row.variable_code} wajib diisi.`);await tx.insert(accreditationIndicatorVariables).values({indicatorId,code:row.variable_code,label:row.variable_label,valueType:row.variable_type||"NUMBER",unit:row.variable_unit||undefined,sequence:sequence+1,status:"ACTIVE"});counts.variables++;}
      if(row.rubric_score){const score=Number(row.rubric_score);if(!Number.isFinite(score)||!row.rubric_label)throw new Error(`Rubrik indikator ${row.indicator_code} tidak valid.`);let conditionRule:unknown=undefined;if(row.rubric_condition_json){try{conditionRule=JSON.parse(row.rubric_condition_json);}catch{throw new Error(`JSON rubrik indikator ${row.indicator_code} tidak valid.`);}}await tx.insert(accreditationScoringRubrics).values({indicatorId,score:String(score),label:row.rubric_label,conditionRule,sequence:sequence+1,status:"ACTIVE"});counts.rubrics++;}
      if(row.evidence_code){if(!row.evidence_description)throw new Error(`Deskripsi evidence ${row.evidence_code} wajib diisi.`);await tx.insert(accreditationEvidenceRequirements).values({indicatorId,code:row.evidence_code,description:row.evidence_description,required:true,acceptableSubjectTypes:row.evidence_subject_types.split(",").map(x=>x.trim()).filter(Boolean),status:"ACTIVE"});counts.evidence++;}
    }
  }).catch(error=>{throw error;});
  await audit({actorId:session.userId,action:"IMPORT_ACCREDITATION_TEMPLATE",subjectType:"ACCREDITATION_FRAMEWORK",subjectId:frameworkId,after:{fileName:file.name,counts}});
  return NextResponse.json({message:"Template berhasil diimpor ke DRAFT.",frameworkId,counts});
}
