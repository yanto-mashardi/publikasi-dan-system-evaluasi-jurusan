"use client";

import { FormEvent,useEffect,useMemo,useState } from "react";

type Row=Record<string,any>;

type Structure={
  clusters:Row[];
  criteria:Row[];
  indicators:Row[];
  evidenceRequirements:Row[];
};

const emptyStructure:Structure={clusters:[],criteria:[],indicators:[],evidenceRequirements:[]};

export default function AccreditationConsole({permissions}:{permissions:string[]}){
  const has=(permission:string)=>permissions.includes(permission);
  const manage=has("accreditation.framework.manage");
  const assign=has("accreditation.assign");
  const[agencies,setAgencies]=useState<Row[]>([]);
  const[frameworks,setFrameworks]=useState<Row[]>([]);
  const[programs,setPrograms]=useState<Row[]>([]);
  const[assignments,setAssignments]=useState<Row[]>([]);
  const[frameworkId,setFrameworkId]=useState(0);
  const[structure,setStructure]=useState<Structure>(emptyStructure);
  const[message,setMessage]=useState("");

  async function request(url:string,method="GET",body?:unknown){
    const response=await fetch(url,{method,headers:body?{"content-type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});
    const data=await response.json().catch(()=>({}));
    if(!response.ok)throw new Error(typeof data.error==="string"?data.error:"Operasi gagal");
    return data;
  }

  async function load(){
    try{
      const[agencyRows,frameworkRows,programRows,assignmentRows]=await Promise.all([
        request("/api/internal/accreditation/agencies"),
        request("/api/internal/accreditation/frameworks"),
        request("/api/internal/study-programs"),
        request("/api/internal/accreditation/assignments"),
      ]);
      setAgencies(agencyRows);
      setFrameworks(frameworkRows);
      setPrograms(programRows);
      setAssignments(assignmentRows);
    }catch(error){setMessage(error instanceof Error?error.message:"Gagal memuat registry");}
  }

  async function loadStructure(id:number){
    if(!id){setStructure(emptyStructure);return;}
    try{setStructure(await request(`/api/internal/accreditation/structure?frameworkId=${id}`));}
    catch(error){setMessage(error instanceof Error?error.message:"Gagal memuat struktur");}
  }

  useEffect(()=>{void load();},[]);
  useEffect(()=>{void loadStructure(frameworkId);},[frameworkId]);

  const selected=useMemo(()=>frameworks.find(row=>row.id===frameworkId),[frameworks,frameworkId]);
  const formData=(event:FormEvent<HTMLFormElement>)=>new FormData(event.currentTarget);

  async function act(action:()=>Promise<unknown>){
    try{
      await action();
      setMessage("Perubahan tersimpan.");
      await load();
      await loadStructure(frameworkId);
    }catch(error){setMessage(error instanceof Error?error.message:"Operasi gagal");}
  }

  return <div className="section">
    {message&&<div className="card" style={{marginBottom:16}}>{message}</div>}

    <section className="grid">
      <div className="card">
        <h2>Lembaga Akreditasi</h2>
        {agencies.map(agency=><p key={agency.id}><b>{agency.code}</b> — {agency.name} <span className="badge">{agency.status}</span></p>)}
        {manage&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);void act(()=>request("/api/internal/accreditation/agencies","POST",{code:String(data.get("code")),name:String(data.get("name")),agencyType:String(data.get("type")||"LAM"),websiteUrl:String(data.get("website")||"")||undefined}));}}>
          <h3>Tambah Lembaga</h3>
          <input name="code" placeholder="LAM_INFOKOM" required/>
          <input name="name" placeholder="Nama lembaga" required/>
          <input name="type" defaultValue="LAM"/>
          <input name="website" placeholder="https://..."/>
          <button className="button">Tambah lembaga</button>
        </form>}
      </div>

      <div className="card">
        <h2>Framework / Instrumen</h2>
        <select value={frameworkId} onChange={event=>setFrameworkId(Number(event.target.value))}>
          <option value={0}>Pilih framework</option>
          {frameworks.filter(row=>row.lifecycleStatus!=="ARCHIVED").map(row=><option key={row.id} value={row.id}>{row.agencyCode} · {row.name} · v{row.versionNumber}</option>)}
        </select>
        {selected&&<>
          <p className="muted">{selected.instrumentType??"—"} · {selected.educationLevel??"semua jenjang"} · {selected.lifecycleStatus}</p>
          {manage&&selected.lifecycleStatus==="DRAFT"&&<button className="button" type="button" onClick={()=>void act(()=>request(`/api/internal/accreditation/frameworks?id=${selected.id}`,"PATCH",{lifecycleStatus:"ACTIVE"}))}>Aktifkan framework</button>}
          {manage&&selected.lifecycleStatus==="ACTIVE"&&<button className="button" type="button" onClick={()=>void act(()=>request(`/api/internal/accreditation/frameworks?id=${selected.id}`,"DELETE"))}>Arsipkan framework</button>}
          {selected.lifecycleStatus==="ACTIVE"&&<p className="muted">Framework aktif bersifat immutable. Perubahan instrumen dilakukan melalui versi baru.</p>}
        </>}
        {manage&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);void act(()=>request("/api/internal/accreditation/frameworks","POST",{agencyId:Number(data.get("agencyId")),code:String(data.get("code")),name:String(data.get("name")),instrumentYear:Number(data.get("year"))||undefined,instrumentType:String(data.get("instrumentType")||"")||undefined,educationLevel:String(data.get("educationLevel")||"")||undefined,modality:String(data.get("modality")||"TATAP_MUKA"),regulationReference:String(data.get("regulation")||"")||undefined,sourceUrl:String(data.get("sourceUrl")||"")||undefined,versionNumber:Number(data.get("version"))||1}));}}>
          <h3>Tambah Framework</h3>
          <select name="agencyId" required><option value="">Pilih lembaga</option>{agencies.filter(row=>row.status==="ACTIVE").map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select>
          <input name="code" placeholder="LAM-X-2026-D3" required/>
          <input name="name" placeholder="Nama instrumen" required/>
          <input name="year" type="number" placeholder="Tahun"/>
          <input name="instrumentType" placeholder="REGULER / PERPANJANGAN / ..."/>
          <input name="educationLevel" placeholder="D3 / S1 / ..."/>
          <input name="modality" defaultValue="TATAP_MUKA"/>
          <input name="version" type="number" defaultValue="1"/>
          <input name="regulation" placeholder="Referensi regulasi"/>
          <input name="sourceUrl" placeholder="URL sumber resmi"/>
          <button className="button">Tambah framework</button>
        </form>}
      </div>
    </section>

    {frameworkId>0&&<>
      <section className="grid">
        <div className="card">
          <h2>Klaster</h2>
          {structure.clusters.slice().sort((a,b)=>a.sequence-b.sequence).map(row=><p key={row.id}><b>{row.code}</b> — {row.name} <span className="badge">{row.semanticGroup??"CUSTOM"}</span></p>)}
          {manage&&selected?.lifecycleStatus==="DRAFT"&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);void act(()=>request("/api/internal/accreditation/structure","POST",{entity:"CLUSTER",frameworkId,code:String(data.get("code")),name:String(data.get("name")),semanticGroup:String(data.get("semanticGroup")||"")||undefined,sequence:Number(data.get("sequence"))||1}));}}>
            <input name="code" placeholder="INPUT" required/>
            <input name="name" placeholder="Nama klaster" required/>
            <input name="semanticGroup" placeholder="INPUT / PROCESS / OUTPUT_OUTCOME"/>
            <input name="sequence" type="number" defaultValue="1"/>
            <button className="button">Tambah klaster</button>
          </form>}
        </div>

        <div className="card">
          <h2>Kriteria</h2>
          {structure.criteria.slice().sort((a,b)=>a.sequence-b.sequence).map(row=><p key={row.id}><b>{row.code}</b> — {row.name}</p>)}
          {manage&&selected?.lifecycleStatus==="DRAFT"&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);void act(()=>request("/api/internal/accreditation/structure","POST",{entity:"CRITERION",frameworkId,code:String(data.get("code")),name:String(data.get("name")),sequence:Number(data.get("sequence"))||1}));}}>
            <input name="code" placeholder="K1" required/>
            <input name="name" placeholder="Nama kriteria" required/>
            <input name="sequence" type="number" defaultValue="1"/>
            <button className="button">Tambah kriteria</button>
          </form>}
        </div>
      </section>

      <section className="card">
        <h2>Indikator</h2>
        {structure.indicators.map(row=><p key={row.id}><b>{row.code}</b> — {row.name}</p>)}
        {manage&&selected?.lifecycleStatus==="DRAFT"&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);const clusterId=Number(data.get("clusterId"));void act(()=>request("/api/internal/accreditation/structure","POST",{entity:"INDICATOR",frameworkId,criterionId:Number(data.get("criterionId")),code:String(data.get("code")),name:String(data.get("name")),description:String(data.get("description")||"")||undefined,unit:String(data.get("unit")||"")||undefined,weight:Number(data.get("weight"))||undefined,sequence:Number(data.get("sequence"))||1,clusterIds:clusterId?[clusterId]:[],primaryClusterId:clusterId||undefined}));}}>
          <select name="criterionId" required><option value="">Pilih kriteria</option>{structure.criteria.filter(row=>row.status==="ACTIVE").map(row=><option key={row.id} value={row.id}>{row.code} — {row.name}</option>)}</select>
          <select name="clusterId"><option value="">Klaster utama (opsional)</option>{structure.clusters.filter(row=>row.status==="ACTIVE").map(row=><option key={row.id} value={row.id}>{row.code} — {row.name}</option>)}</select>
          <input name="code" placeholder="K1-I1" required/>
          <input name="name" placeholder="Nama indikator" required/>
          <textarea name="description" placeholder="Deskripsi indikator"/>
          <input name="unit" placeholder="Unit (opsional)"/>
          <input name="weight" type="number" step="0.0001" placeholder="Bobot (opsional)"/>
          <input name="sequence" type="number" defaultValue="1"/>
          <button className="button">Tambah indikator</button>
        </form>}
      </section>

      <section className="card">
        <h2>Kebutuhan Evidence</h2>
        {structure.evidenceRequirements.map(row=><p key={row.id}><b>{row.code}</b> — {row.description}</p>)}
        {manage&&selected?.lifecycleStatus==="DRAFT"&&structure.indicators.length>0&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);void act(()=>request("/api/internal/accreditation/structure","POST",{entity:"EVIDENCE_REQUIREMENT",indicatorId:Number(data.get("indicatorId")),code:String(data.get("code")),description:String(data.get("description")),required:true,acceptableSubjectTypes:String(data.get("subjectTypes")||"").split(",").map(value=>value.trim()).filter(Boolean)}));}}>
          <select name="indicatorId" required><option value="">Pilih indikator</option>{structure.indicators.filter(row=>row.status==="ACTIVE").map(row=><option key={row.id} value={row.id}>{row.code} — {row.name}</option>)}</select>
          <input name="code" placeholder="EV-01" required/>
          <textarea name="description" placeholder="Dokumen/data yang harus tersedia" required/>
          <input name="subjectTypes" placeholder="KPI_MEASUREMENT,CURRICULUM,..."/>
          <button className="button">Tambah kebutuhan evidence</button>
        </form>}
      </section>
    </>}

    <section className="card">
      <h2>Assignment Framework ke Program Studi</h2>
      {assignments.map(row=><p key={row.id}><b>{row.studyProgramName}</b> → {row.agencyCode} / {row.frameworkName} <span className="badge">{row.assignmentStatus}{row.isPrimary?" · PRIMARY":""}</span></p>)}
      {assign&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);void act(()=>request("/api/internal/accreditation/assignments","POST",{studyProgramId:Number(data.get("studyProgramId")),frameworkId:Number(data.get("frameworkId")),isPrimary:true,officialCoverageReference:String(data.get("coverage")||"")||undefined,notes:String(data.get("notes")||"")||undefined}));}}>
        <select name="studyProgramId" required><option value="">Pilih Program Studi</option>{programs.filter(row=>row.status==="ACTIVE").map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select>
        <select name="frameworkId" required><option value="">Pilih framework ACTIVE</option>{frameworks.filter(row=>row.lifecycleStatus==="ACTIVE").map(row=><option key={row.id} value={row.id}>{row.agencyCode} · {row.name}</option>)}</select>
        <input name="coverage" placeholder="Referensi cakupan resmi / SK / URL"/>
        <input name="notes" placeholder="Catatan assignment"/>
        <button className="button">Tautkan sebagai framework utama</button>
      </form>}
      <p className="muted">LAM Teknik reference seed tidak ditautkan otomatis. Assignment dilakukan setelah cakupan resmi Prodi diverifikasi.</p>
    </section>
  </div>;
}
