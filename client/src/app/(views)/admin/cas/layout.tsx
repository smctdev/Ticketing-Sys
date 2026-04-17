import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Cas",
  description:
    "The official cas page for the SMCT Group of Companies Ticketing website.",
  openGraph: {
    title: "Cas",
    description:
      "The official cas page for the SMCT Group of Companies Ticketing website.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
