import { Metadata } from "next";
import { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Login",
  description: "The official website for SMCT Group of Companies Ticketing",
};

export default function Layout({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}
