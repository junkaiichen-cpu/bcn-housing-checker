import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import ContractLabelFix from "./ContractLabelFix";
import { AppNavigation, LanguageProvider } from "./language";

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
      <body className="min-h-full bg-[#faf9f6] font-sans text-[#14283b]">
        <LanguageProvider>
          <AppNavigation />
          {children}
          <ContractLabelFix />
        </LanguageProvider>
      </body>
    </html>
  );
}
