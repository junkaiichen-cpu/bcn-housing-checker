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
    icon: "/avatar.png?v=2",
    shortcut: "/avatar.png?v=2",
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
      <head>
        {/* 加 ?v=2 强行打破浏览器的图片强缓存 */}
        <link rel="icon" href="/avatar.png?v=2" type="image/png" />
      </head>
      <body className="min-h-full flex flex-col font-sans relative bg-slate-950 text-slate-100">
        {/* 背景图 + 优化后的暗色压暗蒙版 */}
        <div 
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all"
          style={{
            backgroundImage: `url('/back.png')`,
          }}
        >
          {/* 70% 深色遮罩 + 高斯模糊，极大地提升前面所有文字的视觉对比度 */}
          <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-[3px]"></div>
        </div>

        {/* 页面主内容 */}
        <main className="relative z-10 flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}