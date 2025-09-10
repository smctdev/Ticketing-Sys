import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Storage from "@/utils/storage";
import { FileInput } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { isImage } from "@/utils/image-format";

export default function CarouselLayout({ images }: any) {
  return (
    <Carousel>
      <CarouselContent className="items-center">
        {images.map((item: any, index: number) => (
          <CarouselItem key={index}>
            {isImage(item) ? (
              <Image
                alt={`Image ${index}`}
                src={item && Storage(item)}
                width={1000}
                height={1000}
                className="object-contain"
                loading="lazy"
              />
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={Storage(item)} target="_blank">
                    <FileInput className="text-blue-500 hover:text-blue-600 w-full h-full" />
                  </Link>
                </TooltipTrigger>
                <TooltipContent>Download/View</TooltipContent>
              </Tooltip>
            )}
          </CarouselItem>
        ))}
      </CarouselContent>

      {images.length > 1 && (
        <>
          <CarouselPrevious />
          <CarouselNext />
        </>
      )}
    </Carousel>
  );
}
