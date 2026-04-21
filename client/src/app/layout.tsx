import type { Metadata } from "next";
import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import BaseLayout from "@/components/layout/base-layout";
import AuthContextProvider from "@/context/auth-context";
import { IsRefreshProvider } from "@/context/is-refresh-context";
import { SettingsProvider } from "@/context/settings-context";
import logo from "@/assets/logo.png";
import { ChatProvider } from "@/context/chat-context";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://beta-ticketing.smctgroup.ph"),
  title: {
    default: "SMCT Group of Companies Ticketing",
    template: "SMCT Ticketing | %s",
  },
  description: "The official website for SMCT Group of Companies Ticketing",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: {
      default: "SMCT Group of Companies Ticketing",
      template: "SMCT Ticketing | %s",
    },
    description: "The official website for SMCT Group of Companies Ticketing",
    images: [
      {
        url: logo.src,
        alt: "SMCT Logo",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased max-h-screen scroll-smooth`}
      >
        <AuthContextProvider>
          <ChatProvider>
            <IsRefreshProvider>
              <SettingsProvider>
                <BaseLayout>{children}</BaseLayout>
              </SettingsProvider>
            </IsRefreshProvider>
          </ChatProvider>
        </AuthContextProvider>
        <script>
          console.log("%c 𝒮𝑀𝒞𝒯", "font-family:monospace; font-weight: 900;
          font-size: 120px;color: red; text-shadow: 3px 3px 0 rgb(217,324, 422)
          , 6px 6px 0 rgb(333,91,14) , 9px 9px 0 rgb(122,221,8) , 12px 12px 0
          rgb(5,45,68) , 15px 15px 0 rgb(2,22,206) , 18px 18px 0 rgb(4,77,155) ,
          21px 21px 0 rgb(42,21,155)"), console.log("%c 𝓣𝓲𝓬𝓴𝓮𝓽𝓲𝓷𝓰",
          "font-family:monospace; font-weight: 900; font-size: 120px;color: red;
          text-shadow: 3px 3px 0 rgb(217,324, 422) , 6px 6px 0 rgb(333,91,14) ,
          9px 9px 0 rgb(122,221,8) , 12px 12px 0 rgb(5,45,68) , 15px 15px 0
          rgb(2,22,206) , 18px 18px 0 rgb(4,77,155) , 21px 21px 0
          rgb(42,21,155)"), console.log("%c 𝓢𝔂𝓼𝓽𝓮𝓶", "font-family:monospace;
          font-weight: 900; font-size: 120px;color: red; text-shadow: 3px 3px 0
          rgb(217,324, 422) , 6px 6px 0 rgb(333,91,14) , 9px 9px 0
          rgb(122,221,8) , 12px 12px 0 rgb(5,45,68) , 15px 15px 0 rgb(2,22,206)
          , 18px 18px 0 rgb(4,77,155) , 21px 21px 0 rgb(42,21,155)")
        </script>
      </body>
    </html>
  );
}
