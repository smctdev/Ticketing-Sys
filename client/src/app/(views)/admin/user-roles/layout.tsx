import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "User roles",
  description:
    "The official user roles page for the SMCT Group of Companies Ticketing website.",
  openGraph: {
    title: "User roles",
    description:
      "The official user roles page for the SMCT Group of Companies Ticketing website.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
