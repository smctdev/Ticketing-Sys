import { Button } from "@/components/ui/button";
import formattedDateAndTimeStrict from "@/utils/format-date-time-strict";
import { Pencil, Reply, Trash } from "lucide-react";
import { MessageFormInput, MessageType } from "../[id]/page";
import { Dispatch, SetStateAction } from "react";
import AttachmentContent from "./attachment-content";

export default function SenderContent({
  message,
  setFormInput,
}: {
  message: MessageType;
  setFormInput: Dispatch<SetStateAction<MessageFormInput>>;
}) {
  return (
    <div>
      {message?.reply_from && (
        <div className="flex justify-end items-end flex-col">
          <span className="text-[10px] font-semibold">
            You replied to a message
          </span>
          <div
            className="max-w-4/5 w-fit px-4 py-2.5 rounded-2xl rounded-br-sm text-sm wrap-break-word whitespace-break-spaces leading-relaxed bg-chat-background/20 -mb-2 dark:text-white"
            dangerouslySetInnerHTML={{
              __html:
                message?.reply_from?.body ||
                `${message?.reply_attachments_count} attachment(s)`,
            }}
          />
        </div>
      )}
      <div className="flex justify-end items-center gap-2 group">
        <div className="group-hover:block hidden">
          <div className="flex gap-1 items-center">
            <Button
              type="button"
              variant={"link"}
              className="hover:no-underline"
              onClick={() =>
                setFormInput((prev) => ({
                  ...prev,
                  message_id: message?.id,
                  reply_message_content:
                    message?.body ||
                    `${message?.attachments?.length} attachment(s)`,
                }))
              }
            >
              <Reply />
            </Button>
            <Button
              type="button"
              variant={"link"}
              className="hover:no-underline"
            >
              <Trash />
            </Button>
            <Button
              type="button"
              variant={"link"}
              className="hover:no-underline"
            >
              <Pencil />
            </Button>
          </div>
        </div>
        <div className="flex flex-col gap-1 items-end max-w-4/5 min-w-0">
          <div className="self-end w-full">
            {message?.body && (
              <div
                className="px-4 py-2.5 rounded-2xl rounded-br-sm text-sm wrap-break-word whitespace-break-spaces leading-relaxed bg-chat-background dark:text-white shadow-lg shadow-chat-background/50"
                dangerouslySetInnerHTML={{
                  __html: message?.body,
                }}
              />
            )}
          </div>

          <AttachmentContent message={message} />
        </div>
      </div>
      <p className="text-[10px] dark:text-white/20 mt-1 text-right">
        {formattedDateAndTimeStrict(message?.created_at)}
      </p>
    </div>
  );
}
