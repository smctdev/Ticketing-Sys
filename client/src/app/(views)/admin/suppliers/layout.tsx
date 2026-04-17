import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Suppliers",
  description:
    "The official suppliers page for the SMCT Group of Companies Ticketing website.",
  openGraph: {
    title: "Suppliers",
    description:
      "The official suppliers page for the SMCT Group of Companies Ticketing website.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
