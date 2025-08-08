import { ReactNode } from "react";
import SmctBuilding from "@/assets/building.jpg";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "SMCT Group of Companies Ticketing",
    template: "SMCT Group of Companies Ticketing | %s",
  },
  description: "The official website for SMCT Group of Companies Ticketing",
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div
      style={{ backgroundImage: `url(${SmctBuilding.src})` }}
      className="bg-no-repeat bg-cover bg-center"
    >
      <div className="bg-black/50 h-screen overflow-y-auto">{children}</div>
    </div>
  );
}
