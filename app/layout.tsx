import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jk大房子（房产评估与租务风控系统）",
  description: "Barcelona Real Estate Intelligence & Risk Engine",
  icons: {
    icon: [
      { url: "/avatar.png?v=2" },
      { url: "/favicon.ico?v=2" },
    ],
    apple: "/avatar.png?v=2",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased light`}
      style={{ colorScheme: "light" }}
    >
      <body className="min-h-full flex flex-col font-sans relative bg-slate-950 text-slate-100">
        <div 
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all"
          style={{
            backgroundImage: `url('/back.png')`,
          }}
        >
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[3px]"></div>
        </div>

        <main className="relative z-10 flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}