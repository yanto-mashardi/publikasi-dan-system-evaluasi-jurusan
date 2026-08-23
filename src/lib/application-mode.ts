export type ApplicationMode="MASTER"|"TENANT";

export function applicationMode():ApplicationMode{
  return process.env.APP_MODE?.toUpperCase()==="MASTER"?"MASTER":"TENANT";
}

export function isMasterApplication(){return applicationMode()==="MASTER";}
export function isTenantApplication(){return applicationMode()==="TENANT";}

export function assertApplicationMode(expected:ApplicationMode){
  const actual=applicationMode();
  if(actual!==expected)throw new Error(`Fitur ini hanya tersedia pada aplikasi ${expected}. Mode aktif: ${actual}.`);
}
