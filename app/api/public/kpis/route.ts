import { NextResponse } from "next/server";
import { getPublicKpis } from "@/src/services/public-portal";
export async function GET(){return NextResponse.json(await getPublicKpis())}
