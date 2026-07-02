import type { Metadata, Viewport } from "next";
import { Geist_Mono, Inter, Playfair_Display } from "next/font/google";
import SmoothScrollProvider from "@/components/providers/SmoothScrollProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import Navbar from "@/components/ui/Navbar";
import CategoryTabsList from "@/components/ui/CategoryTabsList";
import HeaderHeightSync from "@/components/ui/HeaderHeightSync";
import WhatsAppFloat from "@/components/ui/WhatsAppFloat";
import { PRODUCT_COUNT_DISPLAY } from "@/data/constants";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Perfumes El Pocho | Fragancias Premium en Costa Rica",
  description: `Descubre más de ${PRODUCT_COUNT_DISPLAY} fragancias originales, árabes y de diseñador. Envíos a todo Costa Rica. Calidad garantizada.`,
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
    description: `Más de ${PRODUCT_COUNT_DISPLAY} fragancias originales con envíos a todo Costa Rica.`,
    type: "website",
    locale: "es_CR",
  },
  twitter: {
    card: "summary_large_image",
    title: "Perfumes El Pocho | Fragancias Premium",
    description: `Más de ${PRODUCT_COUNT_DISPLAY} fragancias originales con envíos a todo Costa Rica.`,
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#faf7f2" },
    { media: "(prefers-color-scheme: dark)", color: "#080808" },
  ],
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var systemLight = window.matchMedia('(prefers-color-scheme: light)').matches;
    var theme = stored || (systemLight ? 'light' : 'dark');
    document.documentElement.setAttribute('data-theme', theme);
  } catch (e) {
    document.documentElement.setAttribute('data-theme', 'dark');
  }
})();
`.trim();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es-CR"
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
      </head>
      <body className="min-h-full flex flex-col text-foreground bg-background">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-black"
        >
          Saltar al contenido
        </a>
        <ThemeProvider>
          <SmoothScrollProvider>
            <header data-fixed-header className="fixed top-0 left-0 right-0 z-50">
              <Navbar />
              <CategoryTabsList />
            </header>
            <HeaderHeightSync />
            <div id="main-content" className="flex-1 pt-[var(--real-header-h,var(--header-h))]">
              {children}
            </div>
            <WhatsAppFloat />
          </SmoothScrollProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
