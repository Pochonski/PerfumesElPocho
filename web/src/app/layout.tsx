import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Navbar from "@/components/ui/Navbar";
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
  title: "Perfumes El Pocho | Fragancias Premium",
  description:
    "Descubre fragancias originales, árabes y de diseñador. Envíos a todo Costa Rica. Calidad garantizada.",
  keywords: ["perfumes", "fragancias", "Costa Rica", "árabes", "diseñador"],
  openGraph: {
    title: "Perfumes El Pocho | Fragancias Premium",
    description: "Fragancias originales con envíos a todo Costa Rica.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#080808] text-zinc-100">
        <SmoothScrollProvider>
          <Navbar />
          {children}
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
