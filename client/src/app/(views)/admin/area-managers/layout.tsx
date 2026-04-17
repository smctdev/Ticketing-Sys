import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Area managers",
  description:
    "The official area managers page for the SMCT Group of Companies Ticketing website.",
  openGraph: {
    title: "Area managers",
    description:
      "The official area managers page for the SMCT Group of Companies Ticketing website.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
