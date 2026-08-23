import { cookies } from "next/headers";
import { jwtVerify, SignJWT } from "jose";

export type SessionUser = { userId:number; email:string; name:string; role:string; organizationId:number; studyProgramId?:number|null };
const COOKIE = "upps_session";
function key(){ const secret=process.env.AUTH_SECRET; if(!secret||secret.length<32) throw new Error("AUTH_SECRET minimal 32 karakter."); return new TextEncoder().encode(secret); }
export async function createSession(user:SessionUser){ const token=await new SignJWT(user).setProtectedHeader({alg:"HS256"}).setIssuedAt().setExpirationTime("8h").sign(key()); const store=await cookies(); store.set(COOKIE,token,{httpOnly:true,sameSite:"lax",secure:process.env.NODE_ENV==="production",path:"/",maxAge:28800}); }
export async function clearSession(){ (await cookies()).delete(COOKIE); }
export async function getSession():Promise<SessionUser|null>{ try{const token=(await cookies()).get(COOKIE)?.value;if(!token)return null;const {payload}=await jwtVerify(token,key());return payload as unknown as SessionUser;}catch{return null;} }
