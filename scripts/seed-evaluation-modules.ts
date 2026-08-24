import {requireDb} from "../src/db";
import {evaluationModules} from "../src/db/schema-evaluation-modules";
import {DEFAULT_EVALUATION_MODULES} from "../src/services/evaluation-modules";
async function main(){const db=requireDb();for(const module of DEFAULT_EVALUATION_MODULES)await db.insert(evaluationModules).values(module).onDuplicateKeyUpdate({set:{name:module.name,description:module.description,scopeType:module.scopeType,status:"ACTIVE",updatedAt:new Date()}});console.log(`${DEFAULT_EVALUATION_MODULES.length} modul evaluasi siap.`);}
main().catch(error=>{console.error(error);process.exit(1)});
