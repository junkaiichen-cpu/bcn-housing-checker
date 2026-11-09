import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ContractLabelFix from "./ContractLabelFix";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "BCN Housing | Barcelona Real Estate",
  description: "Property insights and home search for Barcelona.",
  icons: {
    icon: [{ url: "/avatar.png?v=2" }, { url: "/favicon.ico?v=2" }],
    apple: "/avatar.png?v=2",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`} style={{ colorScheme: "light" }}>
      <body className="min-h-full flex flex-col font-sans relative bg-slate-950 text-slate-100">
        <div className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all" style={{ backgroundImage: `url('/back.png')` }}>
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[3px]"></div>
        </div>
        <div className="relative z-10 flex-1 flex flex-col">
          <nav className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-4 px-4 py-3 text-white sm:px-6 lg:px-8">
            <Link href="/" className="text-sm font-bold tracking-[0.12em]">
              BCN HOUSING
            </Link>
            <div className="flex items-center gap-2 text-xs font-semibold sm:gap-3 sm:text-sm">
              <Link
                href="/customer"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 transition hover:bg-white/10"
              >
                房源搜索 · Buscar
              </Link>
              <Link
                href="/admin"
                className="rounded-lg border border-white/15 bg-white/5 px-3 py-2 transition hover:bg-white/10"
              >
                Admin
              </Link>
            </div>
          </nav>
          {children}
          <ContractLabelFix />
        </div>
      </body>
    </html>
  );
}
