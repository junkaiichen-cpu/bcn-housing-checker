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
            // 使用高质量巴塞罗那经典八角街区俯瞰图
            backgroundImage: `url('https://images.unsplash.com/photo-1583422409516-2895a771f6ce?q=80&w=2070&auto=format&fit=crop')`,
          }}
        >
          {/* 渐变滤镜：确保页面文字与白色卡片清晰可见，同时保留高质感城市韵味 */}
          <div className="absolute inset-0 bg-slate-900/65 backdrop-blur-[2px]"></div>
        </div>

        {/* 页面主内容区域 */}
        <main className="relative z-10 flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}