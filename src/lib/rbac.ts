import type { SessionUser } from "./auth";

export function can(user:SessionUser|null,permission:string){
  return !!user&&Array.isArray(user.permissions)&&user.permissions.includes(permission);
}

export function hasRole(user:SessionUser|null,role:string){
  return !!user&&Array.isArray(user.roles)&&user.roles.includes(role);
}

export function scopeAllows(user:SessionUser,organizationId:number,studyProgramId?:number|null){
  if(can(user,"system.configure"))return true;
  const scopes=user.scopes??[];
  return scopes.some(scope=>{
    if(scope.organizationId!==organizationId)return false;
    if(studyProgramId==null)return true;
    return scope.studyProgramId==null||scope.studyProgramId===studyProgramId;
  });
}
