import type { Metadata } from "next";
import { Caveat, Geist, Geist_Mono } from "next/font/google";
import { AppShell } from "@/components/layout/app-shell";
import { getSiteName } from "@/lib/env";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const caveat = Caveat({
  variable: "--font-caveat",
  subsets: ["latin"],
});

const siteName = getSiteName();

export const metadata: Metadata = {
  title: siteName,
  description: "Inventory management system",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${caveat.variable} h-full antialiased`}
    >
      <body className="h-full overflow-hidden bg-zinc-50 text-zinc-900">
        <AppShell siteName={siteName}>{children}</AppShell>
      </body>
    </html>
  );
}
