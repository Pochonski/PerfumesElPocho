import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  ClerkProvider,
  SignInButton,
  SignUpButton,
  Show,
  UserButton,
} from "@clerk/nextjs";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import Navbar from "@/components/ui/Navbar";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
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
  title: "Perfumes El Pocho | Fragancias Premium en Costa Rica",
  description:
    "Descubre más de 4,000 fragancias originales, árabes y de diseñador. Envíos a todo Costa Rica. Calidad garantizada.",
  keywords: [
    "perfumes",
    "fragancias",
    "Costa Rica",
    "árabes",
    "diseñador",
    "perfumes originales",
    "comprar perfumes",
  ],
  openGraph: {
    title: "Perfumes El Pocho | Fragancias Premium",
    description:
      "Más de 4,000 fragancias originales con envíos a todo Costa Rica.",
    type: "website",
    locale: "es_CR",
  },
};

function AuthButtons() {
  return (
    <>
      <Show when="signed-out">
        <div className="hidden items-center gap-3 md:flex">
          <SignInButton mode="modal">
            <button className="text-sm text-zinc-400 transition-colors hover:text-zinc-200 cursor-pointer">
              Iniciar Sesión
            </button>
          </SignInButton>
          <SignUpButton mode="modal">
            <button className="rounded-full border border-[#c8a84e]/30 bg-[#c8a84e]/10 px-4 py-1.5 text-sm font-medium text-[#c8a84e] transition-all hover:bg-[#c8a84e]/20 hover:border-[#c8a84e]/50 cursor-pointer">
              Registrarse
            </button>
          </SignUpButton>
        </div>
      </Show>
      <Show when="signed-in">
        <div className="hidden items-center gap-3 md:flex">
          <UserButton
            appearance={{ elements: { avatarBox: "h-8 w-8" } }}
          />
        </div>
      </Show>
    </>
  );
}

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
        <ClerkProvider>
          <SmoothScrollProvider>
            <Navbar>
              <AuthButtons />
            </Navbar>
            {children}
            <WhatsAppFloat />
          </SmoothScrollProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
