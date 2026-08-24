import "./globals.css";
import "./session.css";
import Link from "next/link";
import {getSession} from "@/src/lib/auth";
import {getSiteIdentity} from "@/src/services/site-identity";
import {isMasterApplication} from "@/src/lib/application-mode";
export const metadata={title:"Publikasi & Evaluasi Jurusan",description:"Integrated UPPS Governance System"};
const roleNames:Record<string,string>={ADMIN_SYSTEM:"Super Admin",ADMIN_DATA:"Admin Jurusan",KAPRODI:"Kaprodi",GKM:"GKM",SEKJUR:"Sekjur",KAJUR:"Kajur / UPPS",VIEWER_INTERNAL:"Pengguna Internal"};
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){const master=isMasterApplication();const[session,identity]=await Promise.all([getSession(),getSiteIdentity()]);const roles=session?.roles.map(role=>roleNames[role]??role).join(", ");return <html lang="id"><body><nav className="nav"><Link className="brand" href={master?"/master":"/"}><span>{master?"MASTER":identity.organization?.type??"JURUSAN"}</span> {master?"Sistem Aplikasi Jurusan":identity.displayName}</Link><div className="navlinks">{master?(session?<><Link href="/internal/accreditation">1. Template LAM</Link><Link href="/master">2. Aplikasi Jurusan</Link><Link href="/internal/federation">3. Federasi</Link></>:null):<><Link href="/">Beranda</Link><Link href="/akreditasi">Akreditasi</Link><Link href="/berita">Berita</Link></>}{session?<><Link className="session-user" href={master?"/master":"/internal"}><span>{master?"Super Admin Master":roles}</span><b>{session.name}</b></Link><form action="/api/auth/logout" method="post"><button className="nav-logout" type="submit">Keluar</button></form></>:<Link className="nav-login" href="/internal/login">{master?"Masuk Super Admin":"Masuk Pengelola"}</Link>}</div></nav>{children}</body></html>}
