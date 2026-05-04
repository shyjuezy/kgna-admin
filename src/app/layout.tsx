import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { isClerkConfigured } from "@/lib/auth";
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
  title: "KGNA Admin",
  description: "Content editor for KGNA pages",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const app = (
    <div className="min-h-full bg-slate-50 text-slate-900">
      {children}
    </div>
  );

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-slate-50 text-slate-900">
        {isClerkConfigured() ? (
          <ClerkProvider>{app}</ClerkProvider>
        ) : (
          app
        )}
      </body>
    </html>
  );
}
