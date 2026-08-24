import {access,cp,mkdir,readFile,rm,writeFile} from "node:fs/promises";
import path from "node:path";
import {randomBytes} from "node:crypto";

const excludedNames=new Set([".git",".next","node_modules",".npm-cache",".gh-cli","tsconfig.tsbuildinfo"]);
function canCopy(sourcePath:string){const name=path.basename(sourcePath);return !excludedNames.has(name)&&(!name.startsWith(".env")||name===".env.example");}

function folderName(name:string,code:string){
  const normalized=name.normalize("NFKD").replace(/[^a-zA-Z0-9\s_-]/g,"").trim().replace(/\s+/g," ").toLowerCase();
  return normalized||code.toLowerCase().replace(/_/g," ");
}

function tenantDatabaseUrl(databaseName:string){
  const raw=process.env.DATABASE_URL;
  if(!raw)throw new Error("DATABASE_URL Master belum dikonfigurasi.");
  const url=new URL(raw);
  url.pathname=`/${databaseName}`;
  return url.toString();
}

export function resolveLocalTenantTarget(name:string,code:string){
  const source=path.resolve(/* turbopackIgnore: true */ process.cwd());
  const configuredRoot=process.env.LOCAL_TENANT_ROOT?.trim();
  const root=path.resolve(/* turbopackIgnore: true */ configuredRoot||path.dirname(source));
  const target=path.resolve(root,folderName(name,code));
  const relative=path.relative(root,target);
  if(!relative||relative.startsWith("..")||path.isAbsolute(relative))throw new Error("Lokasi folder Tenant lokal tidak aman.");
  if(target===source)throw new Error("Folder Tenant lokal tidak boleh sama dengan folder Master.");
  return {source,root,target};
}

export async function assertLocalTenantTargetAvailable(name:string,code:string){
  const location=resolveLocalTenantTarget(name,code);
  try{await access(location.target);throw new Error(`Folder Tenant ${location.target} sudah ada. Gunakan nama Jurusan lain atau pindahkan folder lama terlebih dahulu.`);}catch(error){
    if(error instanceof Error&&"code" in error&&(error as NodeJS.ErrnoException).code==="ENOENT")return location;
    throw error;
  }
}

export async function createLocalTenantInstance(input:{name:string;code:string;databaseName:string;federationToken:string}){
  const {source,root,target}=await assertLocalTenantTargetAvailable(input.name,input.code);

  await mkdir(root,{recursive:true});
  await cp(source,target,{recursive:true,errorOnExist:true,force:false,filter:canCopy});
  const authSecret=randomBytes(48).toString("base64url");
  const environment=[
    "# Dibuat otomatis oleh Master untuk simulasi lokal.",
    "APP_MODE=TENANT",
    `DATABASE_URL=${tenantDatabaseUrl(input.databaseName)}`,
    `AUTH_SECRET=${authSecret}`,
    `FEDERATION_EXPORT_TOKEN=${input.federationToken}`,
    `FEDERATION_APPLICATION_CODE=${input.code}`,
    `FEDERATION_APPLICATION_NAME=${input.name}`,
    "STORAGE_DRIVER=local",
    "EVIDENCE_DIR=.data/evidence",
    "",
  ].join("\n");
  await writeFile(path.join(target,".env.local"),environment,{encoding:"utf8",flag:"wx"});
  return {status:"TENANT_LOCAL_READY",folderPath:target,environmentFile:path.join(target,".env.local")};
}

export async function deleteLocalTenantInstance(input:{name:string;code:string;databaseName:string}){
  const {target}=resolveLocalTenantTarget(input.name,input.code);
  try{
    const environment=await readFile(path.join(target,".env.local"),"utf8");
    const expectedMode=/^APP_MODE=TENANT\s*$/m.test(environment);
    const expectedDatabase=new RegExp(`^DATABASE_URL=.*\\/${input.databaseName.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\s*$`,"m").test(environment);
    if(!expectedMode||!expectedDatabase)throw new Error(`Folder ${target} tidak memiliki konfigurasi Tenant yang sesuai; folder tidak dihapus otomatis.`);
    await rm(target,{recursive:true,force:false});
    return {folderPath:target,folderDeleted:true};
  }catch(error){
    if(error instanceof Error&&"code" in error&&(error as NodeJS.ErrnoException).code==="ENOENT")return {folderPath:target,folderDeleted:false};
    throw error;
  }
}
