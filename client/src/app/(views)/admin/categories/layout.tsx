import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: {
    default: "Categories",
    template: "SMCT Ticketing | %s",
  },
  description:
    "The official categories page for the SMCT Group of Companies Ticketing website.",
  openGraph: {
    title: "Categories",
    description:
      "The official categories page for the SMCT Group of Companies Ticketing website.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
