import { Button } from "@/components/ui/button";
import formattedDateAndTimeStrict from "@/utils/format-date-time-strict";
import { Reply } from "lucide-react";
import { MessageFormInput, MessageType } from "../[id]/page";
import { Dispatch, SetStateAction } from "react";
import AttachmentContent from "./attachment-content";

export default function ReceiverContent({
  message,
  setFormInput,
  data,
}: {
  message: MessageType;
  setFormInput: Dispatch<SetStateAction<MessageFormInput>>;
  data: Record<string, any>;
}) {
  return (
    <div className="group">
      {message?.reply_from && (
        <div className="flex justify-start items-start flex-col">
          <span className="text-[10px] font-semibold">
            {data?.user?.full_name} replied to a message
          </span>
          <div
            className="max-w-4/5 w-fit px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm wrap-break-word whitespace-break-spaces leading-relaxed bg-chat-receiver-background/20 -mb-2 dark:text-whit"
            dangerouslySetInnerHTML={{
              __html:
                message?.reply_from?.body ||
                `${message?.reply_attachments_count} attachment(s)`,
            }}
          />
        </div>
      )}
      <div className="flex justify-start items-center gap-2 group">
        <div className="flex flex-col gap-1 items-start max-w-4/5 min-w-0">
          <div className="self-start w-full">
            {message?.body && (
              <div
                className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm wrap-break-word whitespace-break-spaces leading-relaxed bg-chat-receiver-background dark:text-white shadow-lg shadow-chat-background/50"
                dangerouslySetInnerHTML={{
                  __html: message?.body,
                }}
              />
            )}
          </div>

          <AttachmentContent message={message} />
        </div>

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
          </div>
        </div>
      </div>
      <p className="text-[10px] dark:text-white/20 mt-1 text-left">
        {formattedDateAndTimeStrict(message?.created_at)}
      </p>
    </div>
  );
}
