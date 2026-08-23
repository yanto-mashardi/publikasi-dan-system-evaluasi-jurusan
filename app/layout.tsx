import "./globals.css";
import "./session.css";
import Link from "next/link";
import {getSession} from "@/src/lib/auth";
export const metadata={title:"Publikasi & Evaluasi Jurusan",description:"Integrated UPPS Governance System"};
const roleNames:Record<string,string>={ADMIN_SYSTEM:"Super Admin",ADMIN_DATA:"Admin Jurusan",KAPRODI:"Kaprodi",GKM:"GKM",SEKJUR:"Sekjur",KAJUR:"Kajur / UPPS",VIEWER_INTERNAL:"Pengguna Internal"};
export default async function RootLayout({children}:Readonly<{children:React.ReactNode}>){const session=await getSession();const roles=session?.roles.map(role=>roleNames[role]??role).join(", ");return <html lang="id"><body><nav className="nav"><Link className="brand" href="/"><span>JURUSAN</span> KEMARITIMAN</Link><div className="navlinks"><Link href="/">Beranda</Link><Link href="/akreditasi">Akreditasi</Link><Link href="/berita">Berita</Link>{session?<><Link className="session-user" href="/internal"><span>{roles}</span><b>{session.name}</b></Link><form action="/api/auth/logout" method="post"><button className="nav-logout" type="submit">Logout</button></form></>:<Link className="nav-login" href="/internal/login">Login Pengelola</Link>}</div></nav>{children}</body></html>}
