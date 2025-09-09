import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Storage from "@/utils/storage";
import Image from "next/image";

export default function CarouselLayout({ images }: any) {
  return (
    <Carousel>
      <CarouselContent className="items-center">
        {images.map((item: any, index: number) => (
          <CarouselItem key={index}>
            <Image
              alt={`Image ${index}`}
              src={item && Storage(item)}
              width={1000}
              height={1000}
              className="object-contain"
            />
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
