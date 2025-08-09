import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import BaseLayout from "@/components/layout/base-layout";
import AuthContextProvider from "@/context/auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "SMCT Group of Companies Ticketing | Home",
    template: "SMCT Group of Companies Ticketing | %s",
  },
  description: "The official website for SMCT Group of Companies Ticketing",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-h-screen`}
      >
        <AuthContextProvider>
          <BaseLayout>{children}</BaseLayout>
        </AuthContextProvider>
      </body>
    </html>
  );
}
