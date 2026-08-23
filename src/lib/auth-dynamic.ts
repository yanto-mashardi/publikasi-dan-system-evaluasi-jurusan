export type UserScope={role:string;organizationId:number;studyProgramId?:number|null};

export type DynamicSessionShape={
  roles:string[];
  permissions:string[];
  scopes:UserScope[];
};
