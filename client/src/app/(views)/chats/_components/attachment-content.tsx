import Image from "next/image";
import { MessageType } from "../[id]/page";
import Storage from "@/utils/storage";
import { isImage } from "@/utils/image-format";
import isVideo from "@/utils/is-video";
import isAudio from "@/utils/is-audio";
import { FileIcon, X } from "lucide-react";
import { useAuth } from "@/context/auth-context";
import Link from "next/link";
import CarouselLayout from "@/components/carousel-layout";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function AttachmentContent({
  message,
}: {
  message: MessageType;
}) {
  const { user } = useAuth();
  const [selectedItem, setSelectedItem] = useState<string>("");
  const [isOpenImage, setOpenImage] = useState<boolean>(false);
  const images = message?.attachments?.filter((attachment) =>
    isImage(attachment.path),
  );
  const audios = message?.attachments?.filter((attachment) =>
    isAudio(attachment.path.split(".").pop()),
  );
  const videos = message?.attachments?.filter((attachment) =>
    isVideo(attachment.path.split(".").pop()),
  );
  const files = message?.attachments?.filter(
    (attachment) =>
      !isImage(attachment.path) &&
      !isAudio(attachment.path.split(".").pop()) &&
      !isVideo(attachment.path.split(".").pop()),
  );

  const handleSelectImage = (item: string) => () => {
    if (!item) return;
    setSelectedItem(item);
    setOpenImage(true);
  };

  return (
    <>
      {message?.attachments?.length > 0 && (
        <div className="space-y-2">
          {images?.length > 0 && (
            <div
              className={`grid gap-1 ${images?.length > 1 ? "grid-cols-2" : "grid-cols-1"}`}
            >
              {images.map((attachment) => (
                <div
                  className="w-full h-40 rounded-xl cursor-pointer"
                  key={attachment.id}
                  onClick={handleSelectImage(attachment.path)}
                >
                  <Image
                    alt={attachment.path}
                    src={Storage(attachment.path)}
                    width={50}
                    height={50}
                    className="object-cover w-full h-40 rounded-2xl"
                  />
                </div>
              ))}
            </div>
          )}
          {videos?.length > 0 &&
            videos?.map((attachment) => (
              <video
                width="300"
                height="300"
                controls
                key={attachment.id}
                onClick={handleSelectImage(attachment.path)}
                className="cursor-pointer"
              >
                <source
                  src={Storage(attachment.path)}
                  className="object-cover w-30 h-30 rounded-2xl"
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            ))}
          {audios?.length > 0 &&
            audios?.map((attachment) => (
              <audio controls key={attachment.id}>
                <source
                  src={Storage(attachment.path)}
                  className="object-cover w-30 h-30 rounded-2xl"
                  type="audio/mpeg"
                />
                Your browser does not support the audio element.
              </audio>
            ))}
          {files?.length > 0 && (
            <div
              className={`flex flex-col items-end ${message.sender_id === user?.login_id ? "items-end" : "items-start"}`}
            >
              {files?.map((attachment) => (
                <Link
                  key={attachment.id}
                  href={Storage(attachment.path)}
                  target="_blank"
                  download
                >
                  <div className="flex items-center gap-2 border border-dashed border-gray-300 dark:border-white/10 rounded-lg p-2 max-w-max cursor-pointer">
                    <FileIcon className="w-8 h-8 text-blue-500" />
                    <span className="text-sm text-blue-500">
                      {attachment.path.split("/").pop()}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}
      {isOpenImage && (
        <Dialog open={isOpenImage} onOpenChange={setOpenImage}>
          <DialogContent
            showCloseButton={false}
            className="bg-transparent border-none shadow-none sm:max-w-full h-fit!"
          >
            <Button
              type="button"
              onClick={() => setOpenImage(false)}
              className="absolute top-20 right-5 font-bold bg-transparent hover:bg-black/20"
            >
              <X className="text-white stroke-4" />
            </Button>
            <DialogHeader>
              <DialogTitle></DialogTitle>
            </DialogHeader>
            <div className="p-10">
              <CarouselLayout
                images={message?.attachments?.map((item) => item.path)}
                image={selectedItem}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
