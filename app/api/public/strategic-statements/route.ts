import { NextResponse } from "next/server";
import { getPublicStatements } from "@/src/services/public-portal";
export async function GET(){return NextResponse.json(await getPublicStatements())}
