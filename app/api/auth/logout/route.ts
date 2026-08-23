import { NextResponse } from "next/server";
import { clearSession } from "@/src/lib/auth";
export async function POST(request:Request){await clearSession();return NextResponse.redirect(new URL("/",request.url),303)}
