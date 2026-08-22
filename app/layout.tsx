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
    icon: "/avatar.png",
    shortcut: "/avatar.png",
    apple: "/avatar.png",
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
      <head>
        {/* 显式注入 link 标签，绕过部分浏览器对 Favicon 的强缓存 */}
        <link rel="icon" href="/avatar.png" type="image/png" />
      </head>
      <body className="min-h-full flex flex-col font-sans relative bg-slate-900 text-slate-900">
        {/* 自定义桌面背景图 + 60% 透明度渐变蒙版 */}
        <div 
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all"
          style={{
            backgroundImage: `url('/back.png')`,
          }}
        >
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]"></div>
        </div>

        {/* 页面主内容 */}
        <main className="relative z-10 flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}