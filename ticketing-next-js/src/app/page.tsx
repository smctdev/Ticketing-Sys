import SmctBuilding from "@/assets/building.jpg";
import Logo from "@/assets/logo.png";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div
      className={`h-screen w-full bg-no-repeat bg-cover bg-center`}
      style={{ backgroundImage: `url(${SmctBuilding.src})` }}
    >
      <div className="bg-black/55 h-full w-full">
        <div className="grid place-items-center h-full p-10 text-center">
          <div className="flex flex-col space-y-5 items-center">
            <Image
              src={Logo}
              alt="SMCT Group of Companies Logo"
              width={300}
              height={300}
            />
            <h1 className="text-4xl font-extrabold text-white">
              Welcome to SMCT Group of Companies Ticketing
            </h1>
            <p className="text-white text-2xl">
              The official website for SMCT Group of Companies Ticketing
            </p>
            <Link
              href="/login"
              className="px-5 py-3 w-fit bg-blue-500 hover:bg-blue-600 text-white rounded-md font-bold text-sm"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
