import { NextResponse } from "next/server";
import { clearSession } from "@/src/lib/auth";
import { applicationUrl } from "@/src/lib/request-url";
export async function POST(request:Request){await clearSession();return NextResponse.redirect(applicationUrl(request,"/"),303)}
