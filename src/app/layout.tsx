import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Auth Starter | Login, Register, Profile",
  description: "Aplikasi autentikasi sederhana dengan Next.js, Prisma, Auth.js (credentials), dan reCAPTCHA v2 (invisible).",
  keywords: ["Next.js", "Auth.js", "Prisma", "reCAPTCHA v2", "Login", "Register", "Profile"],
  authors: [{ name: "Auth Starter" }],
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  openGraph: {
    title: "Auth Starter",
    description: "Login, Register, Profile dengan Prisma dan Auth.js",
    url: "http://localhost:3000",
    siteName: "Auth Starter",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Auth Starter",
    description: "Login, Register, Profile dengan Prisma dan Auth.js",
  },
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
          <Toaster />
          
        </Providers>
      </body>
    </html>
  );
}
