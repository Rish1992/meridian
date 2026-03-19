import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";

/* ── Font definitions ─────────────────────────────────────── */

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--next-font-inter",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--next-font-plus-jakarta-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--next-font-geist-mono",
  display: "swap",
});

/* ── Metadata ─────────────────────────────────────────────── */

export const metadata: Metadata = {
  title: {
    default: "Meridian | AI-Powered Airline Claims Intelligence",
    template: "%s | Meridian",
  },
  description:
    "Meridian is an AI-powered platform for intelligent airline claims processing, disruption management, and passenger compensation analytics.",
  keywords: [
    "airline claims",
    "AI claims intelligence",
    "passenger compensation",
    "flight disruption",
    "Meridian",
  ],
  authors: [{ name: "Meridian" }],
  creator: "Meridian",
  metadataBase: new URL("https://meridian.app"),
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://meridian.app",
    siteName: "Meridian",
    title: "Meridian | AI-Powered Airline Claims Intelligence",
    description:
      "AI-powered platform for intelligent airline claims processing and passenger compensation analytics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Meridian | AI-Powered Airline Claims Intelligence",
    description:
      "AI-powered platform for intelligent airline claims processing and passenger compensation analytics.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F8FAFC" },
    { media: "(prefers-color-scheme: dark)",  color: "#0F172A" },
  ],
};

/* ── Root layout ──────────────────────────────────────────── */

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${plusJakartaSans.variable} ${geistMono.variable}`}
    >
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={true}
          disableTransitionOnChange={false}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
