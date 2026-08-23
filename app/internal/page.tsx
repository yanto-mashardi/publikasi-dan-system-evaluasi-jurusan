import { redirect } from "next/navigation";
import { getSession } from "@/src/lib/auth";
export const dynamic="force-dynamic";
export default async function InternalHome(){const session=await getSession();if(!session)redirect("/internal/login");redirect("/internal/accreditation/cockpit")}
