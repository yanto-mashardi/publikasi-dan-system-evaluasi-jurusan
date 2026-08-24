"use client";

import { FormEvent,useEffect,useMemo,useState } from "react";

type Row=Record<string,any>;

type Structure={
  clusters:Row[];
  criteria:Row[];
  indicators:Row[];
  evidenceRequirements:Row[];
};

type Scoring={variables:Row[];rubrics:Row[]};

const emptyStructure:Structure={clusters:[],criteria:[],indicators:[],evidenceRequirements:[]};
const emptyScoring:Scoring={variables:[],rubrics:[]};

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
  const[scoring,setScoring]=useState<Scoring>(emptyScoring);
  const[indicatorId,setIndicatorId]=useState(0);
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
    if(!id){setStructure(emptyStructure);setScoring(emptyScoring);return;}
    try{const[structureRows,scoringRows]=await Promise.all([request(`/api/internal/accreditation/structure?frameworkId=${id}`),request(`/api/internal/accreditation/scoring?frameworkId=${id}`)]);setStructure(structureRows);setScoring(scoringRows);}
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

  async function importExcel(event:FormEvent<HTMLFormElement>){
    event.preventDefault();
    const data=new FormData(event.currentTarget);
    data.set("frameworkId",String(frameworkId));
    try{
      setMessage("Memeriksa dan mengimpor Excel...");
      const response=await fetch("/api/internal/accreditation/import",{method:"POST",body:data});
      const result=await response.json().catch(()=>({}));
      if(!response.ok)throw new Error(typeof result.error==="string"?result.error:"Impor gagal");
      setMessage(`${result.message} ${result.counts.indicators} indikator, ${result.counts.variables} variabel, ${result.counts.rubrics} rubrik, dan ${result.counts.evidence} evidence.`);
      event.currentTarget.reset();
      await loadStructure(frameworkId);
    }catch(error){setMessage(error instanceof Error?error.message:"Impor gagal");}
  }

  return <div className="section">
    {message&&<div className="card" style={{marginBottom:16}}>{message}</div>}

    <section className="grid">
      <div className="card">
        <h2>Lembaga Akreditasi</h2>
        {agencies.map(agency=><p className="registry-row" key={agency.id}><span><b>{agency.code}</b> — {agency.name} <span className="badge">{agency.status}</span></span>{manage&&agency.status==="ACTIVE"&&<button type="button" onClick={()=>void act(()=>request(`/api/internal/accreditation/agencies?id=${agency.id}`,"DELETE"))}>Arsipkan</button>}</p>)}
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
        {manage&&!selected&&<div style={{display:"grid",gap:4,marginTop:12,padding:12,borderLeft:"4px solid #c08a31",borderRadius:7,background:"#fff7df",fontSize:11}}><b>Untuk upload Excel</b><span>Buat framework, lalu pilih framework berstatus DRAFT pada daftar di atas. Tombol unduh format dan kolom upload akan muncul otomatis.</span></div>}
        {selected&&<>
          <p className="muted">{selected.instrumentType??"—"} · {selected.educationLevel??"semua jenjang"} · {selected.lifecycleStatus}</p>
          {manage&&selected.lifecycleStatus==="DRAFT"&&<div className="excel-import">
            <h3>Impor indikator dari Excel</h3>
            <p className="muted">Target: <b>{selected.agencyCode} — {selected.agencyName}</b>, template <b>{selected.name} v{selected.versionNumber}</b>. Data tidak dapat tertukar dengan LAM lain karena masuk langsung ke framework terpilih.</p>
            <a className="button secondary" href="/api/internal/accreditation/import">Unduh format Excel</a>
            <form className="form" encType="multipart/form-data" onSubmit={importExcel}>
              <input name="file" type="file" accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" required/>
              <button className="button">Periksa & impor ke DRAFT</button>
            </form>
            <p className="muted">Impor ditolak bila DRAFT sudah memiliki indikator. Untuk mengganti instrumen, buat versi DRAFT baru, impor, periksa, lalu aktifkan.</p>
          </div>}
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
          {structure.clusters.slice().sort((a,b)=>a.sequence-b.sequence).map(row=><p className="registry-row" key={row.id}><span><b>{row.code}</b> — {row.name} <span className="badge">{row.semanticGroup??"CUSTOM"}</span></span>{manage&&selected?.lifecycleStatus==="DRAFT"&&row.status==="ACTIVE"&&<button type="button" onClick={()=>void act(()=>request("/api/internal/accreditation/structure","PATCH",{entity:"CLUSTER",id:row.id,status:"ARCHIVED"}))}>Arsipkan</button>}</p>)}
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
          {structure.criteria.slice().sort((a,b)=>a.sequence-b.sequence).map(row=><p className="registry-row" key={row.id}><span><b>{row.code}</b> — {row.name}</span>{manage&&selected?.lifecycleStatus==="DRAFT"&&row.status==="ACTIVE"&&<button type="button" onClick={()=>void act(()=>request("/api/internal/accreditation/structure","PATCH",{entity:"CRITERION",id:row.id,status:"ARCHIVED"}))}>Arsipkan</button>}</p>)}
          {manage&&selected?.lifecycleStatus==="DRAFT"&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);void act(()=>request("/api/internal/accreditation/structure","POST",{entity:"CRITERION",frameworkId,code:String(data.get("code")),name:String(data.get("name")),sequence:Number(data.get("sequence"))||1}));}}>
            <input name="code" placeholder="K1" required/>
            <input name="name" placeholder="Nama kriteria" required/>
            <input name="sequence" type="number" defaultValue="1"/>
            <button className="button">Tambah kriteria</button>
          </form>}
        </div>
      </section>

      <section className="card scoring-builder">
        <div className="registry-heading"><div><span className="eyebrow">Mesin evaluasi</span><h2>Variabel, Rumus, dan Rubrik</h2><p className="muted">Pilih indikator di atas. Variabel menjadi kolom isian admin; rumus menghitung hasil; rubrik mengubah hasil menjadi skor. Semua konfigurasi tersimpan sebagai data.</p></div><select value={indicatorId} onChange={event=>setIndicatorId(Number(event.target.value))}><option value={0}>Pilih indikator</option>{structure.indicators.filter(row=>row.status==="ACTIVE").map(row=><option key={row.id} value={row.id}>{row.code} — {row.name}</option>)}</select></div>
        {indicatorId>0&&<div className="scoring-columns"><div><h3>Variabel input</h3>{scoring.variables.filter(row=>row.indicatorId===indicatorId).map(row=><p className="registry-row" key={row.id}><span><b>{row.code}</b> · {row.label} <small>{row.valueType}{row.unit?` · ${row.unit}`:""}</small></span>{manage&&selected?.lifecycleStatus==="DRAFT"&&row.status==="ACTIVE"&&<button type="button" onClick={()=>void act(()=>request("/api/internal/accreditation/scoring","PATCH",{entity:"VARIABLE",id:row.id,status:"ARCHIVED"}))}>Arsipkan</button>}</p>)}{manage&&selected?.lifecycleStatus==="DRAFT"&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);void act(()=>request("/api/internal/accreditation/scoring","POST",{entity:"VARIABLE",indicatorId,code:String(data.get("code")),label:String(data.get("label")),valueType:String(data.get("valueType")),unit:String(data.get("unit")||"")||undefined,required:true,sequence:Number(data.get("sequence"))||1}));}}><input name="code" placeholder="JUMLAH_LULUSAN" required/><input name="label" placeholder="Jumlah lulusan tepat waktu" required/><select name="valueType"><option>NUMBER</option><option>TEXT</option><option>BOOLEAN</option></select><input name="unit" placeholder="orang / % / dokumen"/><input name="sequence" type="number" defaultValue="1"/><button className="button">Tambah variabel</button></form>}</div>
        <div><h3>Rubrik skor</h3>{scoring.rubrics.filter(row=>row.indicatorId===indicatorId).map(row=><p className="registry-row" key={row.id}><span><b>Skor {row.score}</b> · {row.label}<small>{row.description}</small></span>{manage&&selected?.lifecycleStatus==="DRAFT"&&row.status==="ACTIVE"&&<button type="button" onClick={()=>void act(()=>request("/api/internal/accreditation/scoring","PATCH",{entity:"RUBRIC",id:row.id,status:"ARCHIVED"}))}>Arsipkan</button>}</p>)}{manage&&selected?.lifecycleStatus==="DRAFT"&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);let conditionRule:unknown;try{conditionRule=JSON.parse(String(data.get("conditionRule")));}catch{setMessage("Kondisi rubrik harus berupa JSON yang valid.");return;}void act(()=>request("/api/internal/accreditation/scoring","POST",{entity:"RUBRIC",indicatorId,score:Number(data.get("score")),label:String(data.get("label")),description:String(data.get("description")||"")||undefined,conditionRule,sequence:Number(data.get("sequence"))||1}));}}><input name="score" type="number" step="any" placeholder="4" required/><input name="label" placeholder="Melampaui target" required/><textarea name="description" placeholder="Penjelasan rubrik"/><textarea name="conditionRule" defaultValue={'{"variable":"$RESULT","operator":"GTE","value":80}'} required/><input name="sequence" type="number" defaultValue="1"/><button className="button">Tambah rubrik</button></form>}</div></div>}
        {indicatorId>0&&manage&&selected?.lifecycleStatus==="DRAFT"&&<form className="formula-form" onSubmit={event=>{event.preventDefault();const data=formData(event);let scoringRule:unknown;try{scoringRule=JSON.parse(String(data.get("scoringRule")));}catch{setMessage("Rumus harus berupa JSON yang valid.");return;}void act(()=>request("/api/internal/accreditation/structure","PATCH",{entity:"INDICATOR",id:indicatorId,scoringRule}));}}><label><span>Rumus indikator (JSON aman, tanpa eval)</span><textarea name="scoringRule" defaultValue={JSON.stringify(structure.indicators.find(row=>row.id===indicatorId)?.scoringRule??{method:"FORMULA",expression:{op:"PERCENT",args:[{variable:"JUMLAH_TERCAPAI"},{variable:"JUMLAH_TOTAL"}]},precision:2},null,2)}/></label><button className="button">Simpan rumus indikator</button></form>}
      </section>

      <section className="card">
        <h2>Indikator</h2>
        <div className="registry-list">{structure.indicators.map(row=><button className={indicatorId===row.id?"selected":""} type="button" key={row.id} onClick={()=>setIndicatorId(row.id)}><span><b>{row.code}</b> — {row.name}</span><small>{row.status} · bobot {row.weight??"—"}</small></button>)}</div>
        {manage&&selected?.lifecycleStatus==="DRAFT"&&indicatorId>0&&<div className="registry-actions"><button type="button" onClick={()=>void act(()=>request("/api/internal/accreditation/structure","PATCH",{entity:"INDICATOR",id:indicatorId,status:"ARCHIVED"}))}>Arsipkan indikator terpilih</button></div>}
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
        {structure.evidenceRequirements.map(row=><p className="registry-row" key={row.id}><span><b>{row.code}</b> — {row.description}</span>{manage&&selected?.lifecycleStatus==="DRAFT"&&row.status==="ACTIVE"&&<button type="button" onClick={()=>void act(()=>request("/api/internal/accreditation/structure","PATCH",{entity:"EVIDENCE_REQUIREMENT",id:row.id,status:"ARCHIVED"}))}>Arsipkan</button>}</p>)}
        {manage&&selected?.lifecycleStatus==="DRAFT"&&structure.indicators.length>0&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);void act(()=>request("/api/internal/accreditation/structure","POST",{entity:"EVIDENCE_REQUIREMENT",indicatorId:Number(data.get("indicatorId")),code:String(data.get("code")),description:String(data.get("description")),required:true,acceptableSubjectTypes:String(data.get("subjectTypes")||"").split(",").map(value=>value.trim()).filter(Boolean)}));}}>
          <select name="indicatorId" required><option value="">Pilih indikator</option>{structure.indicators.filter(row=>row.status==="ACTIVE").map(row=><option key={row.id} value={row.id}>{row.code} — {row.name}</option>)}</select>
          <input name="code" placeholder="EV-01" required/>
          <textarea name="description" placeholder="Dokumen/data yang harus tersedia" required/>
          <input name="subjectTypes" placeholder="KPI_MEASUREMENT,CURRICULUM,..."/>
          <button className="button">Tambah kebutuhan evidence</button>
        </form>}
      </section>
    </>}

    {!manage&&<section className="card">
      <h2>Template Indikator Program Studi</h2>
      <p className="muted">Super Admin menyediakan LAM dan template global. Kaprodi memilih template utama, menggantinya dengan template lain, atau melepaskan template dari Prodinya sendiri.</p>
      {assignments.map(row=><p className="registry-row" key={row.id}><span><b>{row.studyProgramName}</b> → {row.agencyCode} / {row.frameworkName} <span className="badge">{row.assignmentStatus}{row.isPrimary?" · UTAMA":""}</span></span>{assign&&row.assignmentStatus==="ACTIVE"&&<button type="button" onClick={()=>void act(()=>request(`/api/internal/accreditation/assignments?id=${row.id}`,"DELETE"))}>Lepas template</button>}</p>)}
      {assign&&<form className="form" onSubmit={event=>{event.preventDefault();const data=formData(event);void act(()=>request("/api/internal/accreditation/assignments","POST",{studyProgramId:Number(data.get("studyProgramId")),frameworkId:Number(data.get("frameworkId")),isPrimary:true,officialCoverageReference:String(data.get("coverage")||"")||undefined,notes:String(data.get("notes")||"")||undefined}));}}>
        <select name="studyProgramId" required><option value="">Pilih Program Studi</option>{programs.filter(row=>row.status==="ACTIVE").map(row=><option key={row.id} value={row.id}>{row.name}</option>)}</select>
        <select name="frameworkId" required><option value="">Pilih framework ACTIVE</option>{frameworks.filter(row=>row.lifecycleStatus==="ACTIVE").map(row=><option key={row.id} value={row.id}>{row.agencyCode} · {row.name}</option>)}</select>
        <input name="coverage" placeholder="Referensi cakupan resmi / SK / URL"/>
        <input name="notes" placeholder="Catatan assignment"/>
        <button className="button">Pilih sebagai template utama</button>
      </form>}
      <p className="muted">LAM Teknik reference seed tidak ditautkan otomatis. Assignment dilakukan setelah cakupan resmi Prodi diverifikasi.</p>
    </section>}
  </div>;
}
