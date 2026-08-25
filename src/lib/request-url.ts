export function applicationUrl(request:Request,path:string){
 const configured=process.env.APP_BASE_URL?.trim();
 if(configured){
  const base=new URL(configured);
  if(!["http:","https:"].includes(base.protocol))throw new Error("APP_BASE_URL harus menggunakan http atau https.");
  return new URL(path,base);
 }
 const forwardedHost=request.headers.get("x-forwarded-host")?.split(",")[0]?.trim();
 const forwardedProto=request.headers.get("x-forwarded-proto")?.split(",")[0]?.trim();
 if(forwardedHost&&["http","https"].includes(forwardedProto??""))return new URL(path,`${forwardedProto}://${forwardedHost}`);
 return new URL(path,request.url);
}
