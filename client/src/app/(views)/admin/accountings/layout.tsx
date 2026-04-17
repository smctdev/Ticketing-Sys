import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Accountings",
  description:
    "The official accountings page for the SMCT Group of Companies Ticketing website.",
  openGraph: {
    title: "Accountings",
    description:
      "The official accountings page for the SMCT Group of Companies Ticketing website.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
