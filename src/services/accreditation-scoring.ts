export type NumericValues=Record<string,number>;

type Expression={op?:string;value?:number;variable?:string;args?:Expression[];min?:number;max?:number};
type Condition={all?:Condition[];any?:Condition[];variable?:string;left?:Expression;operator?:string;value?:number;values?:number[]};

function finite(value:number,label:string){if(!Number.isFinite(value))throw new Error(`Nilai ${label} tidak valid.`);return value;}

export function evaluateExpression(expression:unknown,values:NumericValues):number{
  if(typeof expression==="number")return finite(expression,"konstanta");
  if(!expression||typeof expression!=="object")throw new Error("Rumus indikator belum valid.");
  const node=expression as Expression;
  if(node.variable){if(!(node.variable in values))throw new Error(`Variabel ${node.variable} belum diisi.`);return finite(values[node.variable],node.variable);}
  if(typeof node.value==="number")return finite(node.value,"konstanta");
  const args=(node.args??[]).map(arg=>evaluateExpression(arg,values));
  let result:number;
  switch(node.op){
    case "ADD":result=args.reduce((sum,value)=>sum+value,0);break;
    case "SUBTRACT":result=(args[0]??0)-(args[1]??0);break;
    case "MULTIPLY":result=args.reduce((product,value)=>product*value,1);break;
    case "DIVIDE":if((args[1]??0)===0)throw new Error("Pembagi pada rumus tidak boleh nol.");result=(args[0]??0)/args[1];break;
    case "PERCENT":if((args[1]??0)===0)throw new Error("Penyebut persentase tidak boleh nol.");result=((args[0]??0)/args[1])*100;break;
    case "AVERAGE":if(!args.length)throw new Error("Rumus AVERAGE memerlukan nilai.");result=args.reduce((sum,value)=>sum+value,0)/args.length;break;
    case "MIN":result=Math.min(...args);break;
    case "MAX":result=Math.max(...args);break;
    case "CLAMP":result=Math.min(node.max??Infinity,Math.max(node.min??-Infinity,args[0]??0));break;
    default:throw new Error(`Operator rumus ${node.op??"kosong"} tidak didukung.`);
  }
  return finite(result,"hasil perhitungan");
}

export function matchesCondition(condition:unknown,values:NumericValues,result:number):boolean{
  if(!condition||typeof condition!=="object")return false;
  const rule=condition as Condition;
  if(rule.all)return rule.all.every(item=>matchesCondition(item,values,result));
  if(rule.any)return rule.any.some(item=>matchesCondition(item,values,result));
  const left=rule.left?evaluateExpression(rule.left,values):rule.variable==="$RESULT"?result:values[rule.variable??""];
  if(!Number.isFinite(left))return false;
  switch(rule.operator){
    case "GT":return left>(rule.value??0);
    case "GTE":return left>=(rule.value??0);
    case "LT":return left<(rule.value??0);
    case "LTE":return left<=(rule.value??0);
    case "EQ":return left===(rule.value??0);
    case "BETWEEN":return left>=(rule.values?.[0]??-Infinity)&&left<=(rule.values?.[1]??Infinity);
    default:return false;
  }
}

export function calculateIndicator(rule:unknown,values:NumericValues,rubrics:Array<{id:number;score:string|number;conditionRule:unknown;sequence:number}>,weight?:string|null){
  const config=(rule&&typeof rule==="object"?rule:{}) as {method?:string;expression?:unknown;precision?:number};
  const method=config.method??(config.expression?"FORMULA":"MANUAL");
  if(method==="MANUAL")return {method,result:null,score:null,weightedScore:null,matchedRubricId:null};
  const result=evaluateExpression(config.expression,values);
  const precision=Math.min(6,Math.max(0,config.precision??2));
  const rounded=Number(result.toFixed(precision));
  const rubric=[...rubrics].sort((a,b)=>a.sequence-b.sequence).find(item=>matchesCondition(item.conditionRule,values,rounded));
  const score=rubric?Number(rubric.score):null;
  return {method,result:rounded,score,weightedScore:score===null?null:Number((score*Number(weight??1)).toFixed(4)),matchedRubricId:rubric?.id??null};
}
