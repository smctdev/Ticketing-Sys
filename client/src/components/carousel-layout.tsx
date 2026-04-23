import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import Storage from "@/utils/storage";
import {
  FileInput,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  RefreshCcw,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Tooltip, TooltipContent, TooltipTrigger } from "./ui/tooltip";
import { isImage } from "@/utils/image-format";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import { Button } from "./ui/button";
import isVideo from "@/utils/is-video";
import isAudio from "@/utils/is-audio";

interface CarouselProps {
  images: string[];
  image?: string;
}

function ZoomableImage({
  src,
  alt,
  setIsZoom,
}: {
  src: string;
  alt: string;
  setIsZoom: Dispatch<SetStateAction<boolean>>;
}) {
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const isDragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0 });
  const lastPosition = useRef({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const [rotate, setRotate] = useState<{ deg: number; rotation: string }>({
    deg: 0,
    rotation: "rotate-0",
  });

  const clampPosition = (x: number, y: number, currentScale: number) => {
    if (!containerRef.current) return { x, y };
    const { width, height } = containerRef.current.getBoundingClientRect();
    const maxX = (width * (currentScale - 1)) / 2;
    const maxY = (height * (currentScale - 1)) / 2;
    return {
      x: Math.min(Math.max(x, -maxX), maxX),
      y: Math.min(Math.max(y, -maxY), maxY),
    };
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((prev) => {
      const next = Math.min(Math.max(prev - e.deltaY * 0.005, 1), 5);
      if (next === 1) setPosition({ x: 0, y: 0 });
      else setPosition((pos) => clampPosition(pos.x, pos.y, next));
      return next;
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale === 1) return;
    isDragging.current = true;
    setIsZoom(true);
    dragStart.current = { x: e.clientX, y: e.clientY };
    lastPosition.current = position;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current.x;
    const dy = e.clientY - dragStart.current.y;
    setPosition(
      clampPosition(
        lastPosition.current.x + dx,
        lastPosition.current.y + dy,
        scale,
      ),
    );
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    setIsZoom(false);
  };

  const zoom = (delta: number) => {
    setScale((prev) => {
      const next = Math.min(Math.max(prev + delta, 1), 5);
      if (next === 1) setPosition({ x: 0, y: 0 });
      else setPosition((pos) => clampPosition(pos.x, pos.y, next));
      return next;
    });
  };

  const reset = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
        <Button
          variant={"link"}
          onClick={() =>
            setRotate((prev) => ({
              deg: (prev.deg + 90) % 360,
              rotation: `${(prev.deg + 90) % 360}deg`,
            }))
          }
          className="text-white disabled:opacity-30 hover:scale-110 transition-all duration-300"
        >
          <RefreshCcw size={18} />
        </Button>
        <Button
          variant={"link"}
          onClick={() => zoom(-0.5)}
          disabled={scale <= 1}
          className="text-white disabled:opacity-30 hover:scale-110 transition-all duration-300 ease-in-out"
        >
          <ZoomOut size={18} />
        </Button>
        <span className="text-white text-xs font-semibold w-10 text-center">
          {Math.round(scale * 100)}%
        </span>
        <Button
          variant={"link"}
          onClick={() => zoom(0.5)}
          disabled={scale >= 5}
          className="text-white disabled:opacity-30 hover:scale-110 transition-all duration-300 ease-in-out"
        >
          <ZoomIn size={18} />
        </Button>
        {scale > 1 && (
          <Button
            variant={"link"}
            onClick={reset}
            className="text-white hover:scale-110 transition-all duration-300 ease-in-out ml-1 border-l border-white/30 pl-3"
          >
            <RotateCcw size={15} />
          </Button>
        )}
      </div>

      <div
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        style={{
          transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
          transition: isDragging.current ? "none" : "transform 0.15s ease",
          cursor:
            scale > 1 ? (isDragging.current ? "grabbing" : "grab") : "default",
          transformOrigin: "center center",
        }}
        className="relative w-full h-full"
      >
        <Image
          alt={alt}
          src={src}
          fill
          className="object-contain select-none transition-all duration-300 ease-in-out"
          style={{ rotate: rotate.rotation }}
          loading="lazy"
          draggable={false}
        />
      </div>
    </div>
  );
}

export default function CarouselLayout({ images, image }: CarouselProps) {
  const [api, setApi] = useState<any>(null);
  const [isZoom, setIsZoom] = useState<boolean>(false);

  useEffect(() => {
    if (!api || !images || !image) return;
    const index = images.findIndex((item) => item === image);
    if (index >= 0) api.scrollTo(index);
  }, [api, images, image]);

  useEffect(() => {
    const handleNextPrev = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") api.scrollNext();
      else if (e.key === "ArrowLeft") api.scrollPrev();
    };
    window.addEventListener("keydown", handleNextPrev);
    return () => window.removeEventListener("keydown", handleNextPrev);
  }, [api]);

  return (
    <Carousel
      setApi={setApi}
      opts={{
        watchDrag: !isZoom,
      }}
    >
      <CarouselContent>
        {images.map((item: any, index: number) => (
          <CarouselItem
            key={index}
            className="flex items-center justify-center"
          >
            {isImage(item) ? (
              <ZoomableImage
                src={Storage(item)}
                alt={`Image ${index}`}
                setIsZoom={setIsZoom}
              />
            ) : isVideo(item.split(".").pop()) ? (
              <div className="relative w-full h-screen flex items-center justify-center">
                <video
                  width="700"
                  height="700"
                  controls
                  className="cursor-pointer"
                >
                  <source
                    src={Storage(item)}
                    className="object-cover w-40 h-40 rounded-2xl"
                    type="video/mp4"
                  />
                  Your browser does not support the video tag.
                </video>
              </div>
            ) : isAudio(item.split(".").pop()) ? (
              <div className="relative w-full h-screen flex items-center justify-center">
                <audio controls>
                  <source
                    src={Storage(item)}
                    className="object-cover w-40 h-40 rounded-2xl"
                    type="audio/mpeg"
                  />
                  Your browser does not support the audio element.
                </audio>
              </div>
            ) : (
              <div className="relative w-full h-screen">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={Storage(item)}
                      target="_blank"
                      title="Download/View"
                    >
                      <FileInput className="text-blue-500 hover:text-blue-600 w-full h-full" />
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent>Download/View</TooltipContent>
                </Tooltip>
              </div>
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
