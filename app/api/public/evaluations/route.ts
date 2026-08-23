import { NextResponse } from "next/server";
import { getPublicEvaluations } from "@/src/services/public-portal";
export async function GET(){return NextResponse.json(await getPublicEvaluations());}
