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
  // 配置浏览器标签页 Icon
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
      <body className="min-h-full flex flex-col font-sans relative bg-slate-900 text-slate-900">
        {/* 背景图 + 高级半透明遮罩层 */}
        <div 
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat transition-all"
          style={{
            // 使用 public 目录下的 back.png
            backgroundImage: `url('/back.png')`,
          }}
        >
          {/* 渐变滤镜：确保前景文字和白色卡片清晰、高可读 */}
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