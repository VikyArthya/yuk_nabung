import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProviders } from "@/components/providers/session-provider";
import NavbarSuperbank from "@/components/layout/navbar-superbank";
import FooterSuperbank from "@/components/layout/footer-superbank";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YukNabung - Aplikasi Manajemen Keuangan Pribadi",
  description: "Aplikasi manajemen keuangan pribadi untuk mengatur gaji, target nabung, dan tracking pengeluaran dengan mudah dan efisien",
  keywords: ["manajemen keuangan", "budgeting", "menabung", "tracking pengeluaran", "dompet digital"],
  authors: [{ name: "YukNabung Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-orange-50 via-yellow-50 to-white min-h-screen flex flex-col`}
      >
        <SessionProviders>
          <NavbarSuperbank />
          <main className="flex-grow pt-16 lg:pt-20">
            {children}
          </main>
          <FooterSuperbank />
        </SessionProviders>
      </body>
    </html>
  );
}
