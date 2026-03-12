import type { Metadata } from "next";
import { Inter, Cairo, Bebas_Neue } from "next/font/google";
import "./globals.css";
import NavBar from "@/components/shared/NavBar";
import Footer from "@/components/shared/Footer";
import BottomTabBar from "@/components/shared/BottomTabBar";
import PageTransition from "@/components/shared/PageTransition";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["latin", "arabic"],
});

const bebas = Bebas_Neue({
  weight: "400",
  variable: "--font-bebas",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StreamVault - Premium Entertainment",
  description: "Watch Anything. Anywhere. Anytime. Movies & Series.",
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${inter.variable} ${cairo.variable} ${bebas.variable} font-sans antialiased text-foreground min-h-screen flex flex-col overflow-x-hidden bg-[#0B0B0F]`}
      >
        {/* Global Ambient Glossy Background */}
        <div className="fixed inset-0 z-[-1] pointer-events-none overflow-hidden bg-[#0B0B0F]">
          {/* Deep ambient lighting orbs simulating featured content color spill */}
          <div className="absolute top-[-30%] left-[-20%] w-[90vw] h-[90vw] bg-[#221042] rounded-full blur-[160px] opacity-90" />
          <div className="absolute top-[20%] right-[-20%] w-[80vw] h-[80vw] bg-[#0D2447] rounded-full blur-[180px] opacity-80" />
          <div className="absolute bottom-[-30%] left-[10%] w-[100vw] h-[100vw] bg-[#081329] rounded-full blur-[150px] opacity-95" />

          {/* The Global Apple TV Glass Surface Layer */}
          <div className="absolute inset-0 bg-[rgba(255,255,255,0.01)] backdrop-blur-[60px]" />

          {/* Glossy Diagonal Refraction line (The Glass Screen Reflection) */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/[0.04] via-transparent to-black/[0.6] mix-blend-overlay" />
        </div>

        <NavBar />
        <main className="flex-grow">
          <PageTransition>
            {children}
          </PageTransition>
          <BottomTabBar />
        </main>
        <Footer />
      </body>
    </html>
  );
}
