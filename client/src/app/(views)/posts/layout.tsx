import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Posts",
  description:
    "The official posts page for the SMCT Group of Companies Ticketing website.",
  openGraph: {
    title: "Posts",
    description:
      "The official posts page for the SMCT Group of Companies Ticketing website.",
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
