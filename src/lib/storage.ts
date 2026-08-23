import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
export async function storeEvidence(file:File){const bytes=Buffer.from(await file.arrayBuffer());const checksum=createHash("sha256").update(bytes).digest("hex");const base=process.env.EVIDENCE_DIR??".data/evidence";await mkdir(base,{recursive:true});const safeName=file.name.replace(/[^a-zA-Z0-9._-]/g,"_");const key=`${Date.now()}-${checksum.slice(0,12)}-${safeName}`;await writeFile(path.join(base,key),bytes);return{storageKey:key,checksum,mimeType:file.type||"application/octet-stream"};}
