import "./globals.css";
import Link from "next/link";
export const metadata={title:"Publikasi & Evaluasi Jurusan",description:"Integrated UPPS Governance System"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="id"><body><nav className="nav"><div className="brand">UPPS Governance System</div><div className="navlinks"><Link href="/">Portal Publik</Link><Link href="/akreditasi">Informasi Akreditasi</Link><Link href="/internal">Workspace Internal</Link></div></nav>{children}</body></html>}
