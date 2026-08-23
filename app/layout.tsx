import "./globals.css";
import Link from "next/link";
export const metadata={title:"Publikasi & Evaluasi Jurusan",description:"Integrated UPPS Governance System"};
export default function RootLayout({children}:Readonly<{children:React.ReactNode}>){return <html lang="id"><body><nav className="nav"><Link className="brand" href="/"><span>JURUSAN</span> KEMARITIMAN</Link><div className="navlinks"><Link href="/">Beranda</Link><Link href="/akreditasi">Akreditasi</Link><Link href="/berita">Berita</Link><Link className="nav-login" href="/internal">Ruang Kerja</Link></div></nav>{children}</body></html>}
