import { Dispatch, RefObject, SetStateAction } from "react";
import { MessageFormInput, MessageType } from "../[id]/page";
import { isImage } from "@/utils/image-format";
import Image from "next/image";
import isVideo from "@/utils/is-video";
import isAudio from "@/utils/is-audio";
import { FileIcon, Mic, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ReplyingAttachmentContent({
  formInput,
  setFormInput,
  inputRef,
  isEditingMessage,
  setIsEditingMessage,
  textAreaRef,
  buttonRef,
}: {
  formInput: MessageFormInput;
  setFormInput: Dispatch<SetStateAction<MessageFormInput>>;
  inputRef: RefObject<HTMLInputElement | null>;
  isEditingMessage: {
    isEditing: boolean;
    message: MessageType;
  };
  setIsEditingMessage: Dispatch<
    SetStateAction<{
      isEditing: boolean;
      message: MessageType;
    }>
  >;
  textAreaRef: RefObject<HTMLTextAreaElement | null>;
  buttonRef: RefObject<HTMLButtonElement | null>;
}) {
  return (
    <>
      {(formInput.reply_message_content ||
        formInput.attachments.length > 0 ||
        isEditingMessage?.isEditing) && (
        <div className="p-3 border -mb-0.5 rounded-xl grid grid-cols-[95%_5%] items-center">
          <div className="flex flex-col space-y-5 w-full">
            {isEditingMessage?.isEditing && (
              <div className="text-xs line-clamp-2 wrap-break-word">
                <span className="font-semibold">Editing a message</span>
              </div>
            )}
            {formInput.reply_message_content && (
              <div className="text-xs line-clamp-2 wrap-break-word">
                <span className="font-semibold">Replying to:</span>{" "}
                {formInput.reply_message_content}
              </div>
            )}
            {formInput.attachments.length > 0 && (
              <div className="flex items-center gap-1 overflow-x-auto">
                {formInput.attachments.map((attachment, index) => (
                  <div className="relative group rounded-2xl" key={index}>
                    {isImage(attachment.name) ? (
                      <Image
                        alt={attachment.name}
                        src={URL.createObjectURL(attachment)}
                        width={50}
                        height={50}
                        className="object-cover w-20 h-20 rounded-2xl"
                      />
                    ) : isVideo(attachment.name.split(".").pop()) ? (
                      <video
                        src={URL.createObjectURL(attachment)}
                        className="object-cover w-20 h-20 rounded-2xl"
                      />
                    ) : isAudio(attachment.name.split(".").pop()) ? (
                      <Mic className="w-20 h-20" />
                    ) : (
                      <FileIcon className="w-20 h-20" />
                    )}
                    <Button
                      type="button"
                      variant={"link"}
                      className="invisible group-hover:visible absolute bg-black/80 text-red-500 w-full h-full top-0 left-0 flex items-center justify-center"
                      onClick={() => {
                        setFormInput((prev) => ({
                          ...prev,
                          attachments: formInput.attachments.filter(
                            (_, idx) => idx !== index,
                          ),
                        }));
                        textAreaRef?.current?.focus();
                        if (inputRef.current) {
                          inputRef.current.value = "";
                        }
                      }}
                    >
                      <X />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <Button
            ref={buttonRef}
            type="button"
            variant={"link"}
            onClick={() => {
              setIsEditingMessage({
                isEditing: false,
                message: {} as MessageType,
              });
              setFormInput((prev) => ({
                ...prev,
                reply_message_content: "",
                message: "",
                attachments: [],
              }));
              textAreaRef?.current?.focus();
            }}
          >
            <X />
          </Button>
        </div>
      )}
    </>
  );
}
