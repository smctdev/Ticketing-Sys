"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ChatSkeleton } from "@/components/chat-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ButtonLoader from "@/components/ui/button-loader";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CAN_ACCESS_ALL } from "@/constants/roles";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";
import { useSimple } from "@/hooks/use-simple";
import { api } from "@/lib/api";
import withAuthPage from "@/lib/hoc/with-auth-page";
import nameShortHand from "@/utils/name-short-hand";
import Storage from "@/utils/storage";
import {
  ArrowDown,
  Ellipsis,
  Image as ImageIcon,
  MessageCircleOff,
  MessageCircleX,
  SendHorizonal,
} from "lucide-react";
import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import ReceiverContent from "../_components/receiver-content";
import SenderContent from "../_components/sender-content";
import ReplyingAttachmentContent from "../_components/replying-attachment-content";

export type AttachmentType = {
  id: number;
  path: string;
};

export type MessageType = {
  id: number;
  sender_id: number;
  receiver_id: number;
  body: string;
  attachments: AttachmentType[];
  reply_from: ReplyFormType;
  created_at: Date;
  reply_attachments_count: number;
  type?: null | "created" | "updated" | "deleted";
  is_edited: boolean;
};

export type ReplyFormType = {
  id: number;
  body: string;
};

export type MessageFormInput = {
  message: string;
  message_id: number | null;
  attachments: File[];
  reply_message_content: string;
};

function ChatsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading, errorStatus, handleNextPage, loadMore } = useSimple(
    `/chats/${id}`,
  );
  const { typing, handleTyping } = useChat();
  const searchParams = useSearchParams();
  const ticketCode = Number(searchParams.get("ticket_code")) || "";
  const { newMessage, setMessageRecords } = useChat();
  const [formInput, setFormInput] = useState<MessageFormInput>({
    message: ticketCode
      ? `Hello, let's discuss the ticket with code #${ticketCode}?`
      : "",
    message_id: null,
    attachments: [],
    reply_message_content: "",
  });
  const [messages, setMessages] = useState<MessageType[]>([]);
  const messageRef = useRef<MessageType | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const convoRef = useRef<HTMLDivElement>(null);
  const [isButtonUp, setIsButtonUp] = useState<boolean>(false);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const originalTitle = useRef<string>(document.title);
  const pathname = usePathname();
  const router = useRouter();
  const submittedRef = useRef<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isEditing, setIsEditing] = useState<{ [key: number]: boolean }>({});
  const [isEditingMessage, setIsEditingMessage] = useState<{
    isEditing: boolean;
    message: MessageType;
  }>({ isEditing: false, message: {} as MessageType });
  const [isDeletingMessage, setIsDeletingMessage] = useState<{
    isDeleting: boolean;
    message: MessageType;
    isLoadingDelete: boolean;
  }>({ isDeleting: false, message: {} as MessageType, isLoadingDelete: false });

  useEffect(() => {
    setMessageRecords((prev) =>
      prev.filter((item) => item.login_id !== Number(id)),
    );
  }, [id]);

  useEffect(() => {
    if (!ticketCode || submittedRef.current) return;

    submittedRef.current = true;

    textAreaRef.current?.focus();

    handleSubmit({ preventDefault: () => {} } as any);

    router.replace(pathname);
  }, [ticketCode, router, pathname]);

  useEffect(() => {
    const handleScroll = (e: any) => {
      const { scrollTop } = e.target;
      setIsButtonUp(scrollTop < -500);
    };

    convoRef.current?.addEventListener("scroll", handleScroll);

    return () => {
      convoRef.current?.removeEventListener("scroll", handleScroll);
    };
  }, [isLoading]);

  useEffect(() => {
    if (!data?.data?.data) return;

    setMessages((prev) => [
      ...prev,
      ...data.data?.data.filter(
        (message: any) =>
          !prev.some((prevMessage) => message.id === prevMessage.id),
      ),
    ]);

    document.title = `${originalTitle.current} | ${data?.user?.full_name}`;
  }, [data]);

  useEffect(() => {
    if (isEditingMessage.isEditing) {
      inputRef.current?.focus();
      setFormInput({
        ...formInput,
        message: isEditingMessage.message.body,
      });
    }
  }, [isEditingMessage]);

  useEffect(() => {
    if (newMessage?.type === "updated") {
      setMessages((prev) =>
        prev.map((item) => (item.id === newMessage.id ? newMessage : item)),
      );
      return;
    }

    if (newMessage?.type === "deleted") {
      setMessages((prev) => prev.filter((item) => item.id !== newMessage.id));
      return;
    }

    if (
      !newMessage ||
      messageRef.current?.id === newMessage?.id ||
      newMessage?.sender_id !== Number(id) ||
      newMessage?.sender_id === newMessage?.receiver_id
    )
      return;

    messageRef.current = newMessage;

    setMessages((prev) => [newMessage, ...prev]);
  }, [newMessage, id]);

  const handleSubmit = async (
    e: FormEvent<HTMLFormElement | HTMLTextAreaElement>,
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    textAreaRef.current?.focus();
    try {
      const formData = new FormData();

      formData.append("receiver_id", id as string);
      formData.append("body", formInput.message);
      if (formInput.attachments.length > 0) {
        formInput.attachments.forEach((attachment) => {
          formData.append("attachments[]", attachment);
        });
      }

      if (formInput.message_id) {
        formData.append("message_id", String(formInput.message_id));
      }

      const response = await api.post(`/chats`, formData);

      if (response.status === 201) {
        setFormInput({
          message: "",
          message_id: null,
          attachments: [],
          reply_message_content: "",
        });
        setMessages((prev) => [response.data.data, ...prev]);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnKeyUp = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (
      !e.shiftKey &&
      e.key === "Enter" &&
      formInput.message.trim() &&
      !isSubmitting
    ) {
      isEditingMessage.isEditing ? handleUpdate(e) : handleSubmit(e);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setFormInput((prev) => ({
        ...prev,
        attachments: [...prev.attachments, ...Array.from(files)],
      }));
    }
  };

  const handleUpdate = async (
    e: FormEvent<HTMLFormElement | HTMLTextAreaElement>,
  ) => {
    e.preventDefault();
    setIsSubmitting(true);
    textAreaRef.current?.focus();
    try {
      const response = await api.patch(
        `/chats/${isEditingMessage.message.id}`,
        {
          body: formInput.message,
        },
      );

      if (response.status === 200) {
        setFormInput({
          message: "",
          message_id: null,
          attachments: [],
          reply_message_content: "",
        });

        setMessages((prev) =>
          prev.map((message) =>
            message.id === response.data.data.id ? response.data.data : message,
          ),
        );

        setIsEditingMessage({ isEditing: false, message: {} as MessageType });
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMessage = async () => {
    setIsDeletingMessage((prev) => ({ ...prev, isLoadingDelete: true }));
    try {
      const response = await api.delete(
        `/chats/${isDeletingMessage.message.id}`,
      );
      if (response.status === 200) {
        setMessages((prev) =>
          prev.filter((message) => message.id !== isDeletingMessage.message.id),
        );
        setIsDeletingMessage({
          isDeleting: false,
          message: {} as MessageType,
          isLoadingDelete: false,
        });

        setFormInput({
          message: "",
          message_id: null,
          attachments: [],
          reply_message_content: "",
        });

        setMessages((prev) =>
          prev.map((message) =>
            message.id === response.data.data.id ? response.data.data : message,
          ),
        );

        setIsEditingMessage({ isEditing: false, message: {} as MessageType });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsDeletingMessage((prev) => ({ ...prev, isLoadingDelete: false }));
    }
  };

  if (isLoading) return <ChatSkeleton />;

  return (
    <div className="flex flex-col h-full">
      {errorStatus === 404 ? (
        <div className="flex flex-col items-center justify-center text-center px-8 h-[calc(100vh-60px)]">
          <div className="w-20 h-20 rounded-3xl bg-chat-background border border-violet-500/20 flex items-center justify-center mb-6">
            <MessageCircleOff />
          </div>
          <p className="dark:text-white/60 font-semibold text-lg">
            No conversation found
          </p>
          <p className="dark:text-white/25 text-sm mt-2 max-w-xs">
            Select a conversation from{" "}
            <Link
              href="/chats"
              className="text-blue-500 hover:text-blue-600 underline"
            >
              Chats
            </Link>{" "}
            to continue
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-3 px-6 py-4 border-b shadow-xl shadow-chat-background/15">
            <Avatar className="w-9 h-9">
              <AvatarImage src={Storage(data?.user?.profile_pic)} />
              <AvatarFallback className="text-xs font-bold">
                {nameShortHand(data?.user?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-semibold dark:text-white">
                {data?.user?.full_name}
              </span>
            </div>
          </div>
          <Separator className="bg-background/5" />
          <div className="flex h-full overflow-hidden relative">
            <div
              className="flex flex-col-reverse px-6 py-4 overflow-y-auto h-full w-full"
              ref={convoRef}
            >
              {typing.isTyping &&
                typing.target_id === user?.login_id &&
                typing.typer_id === Number(id) && (
                  <span className="flex items-center gap-3 justify-center text-[10px]">
                    <span className="flex gap-1">
                      {Array.from({ length: 3 }).map((_, index) => (
                        <span
                          key={index}
                          className="w-1 h-1 rounded-full bg-chat-receiver-background animate-bounce [animation-delay:0.2s]"
                          style={{
                            animationDelay: `${index * 0.1}s`,
                          }}
                        />
                      ))}
                    </span>
                    <span>{typing.user} is typing...</span>
                  </span>
                )}
              {messages?.length > 0 ? (
                <>
                  {messages.map((message: MessageType) => (
                    <div
                      key={message?.id}
                      className={
                        isEditingMessage.isEditing
                          ? `${isEditing[message?.id] ? "" : "bg-chat-background/30"}`
                          : ""
                      }
                    >
                      {message?.sender_id === user?.login_id ? (
                        <SenderContent
                          message={message}
                          setFormInput={setFormInput}
                          setIsEditing={setIsEditing}
                          setIsEditingMessage={setIsEditingMessage}
                          setIsDeletingMessage={setIsDeletingMessage}
                        />
                      ) : (
                        <ReceiverContent
                          message={message}
                          setFormInput={setFormInput}
                          data={data}
                        />
                      )}
                    </div>
                  ))}
                  {data?.data?.next_page_url && (
                    <ButtonLoader
                      type="button"
                      variant={"link"}
                      onClick={handleNextPage}
                      isLoading={loadMore}
                    >
                      Load more
                    </ButtonLoader>
                  )}
                </>
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-chat-background border border-violet-500/20 flex items-center justify-center mb-4">
                    <MessageCircleX />
                  </div>
                  <p className="dark:text-white/40 text-sm font-medium">
                    No messages yet
                  </p>
                  <p className="dark:text-white/20 text-xs mt-1">
                    Say hi to {data?.user?.full_name}! 👋
                  </p>
                </div>
              )}
            </div>

            <Button
              type="button"
              variant={"link"}
              className={`${isButtonUp ? "bottom-5 opacity-100" : "-bottom-12 opacity-0 pointer-events-none"} absolute w-fit left-1/2 -translate-x-1/2 bg-chat-receiver-background rounded-full transition-all duration-300 ease-in-out`}
              onClick={() =>
                convoRef.current?.scrollTo(0, convoRef.current?.scrollHeight)
              }
            >
              <ArrowDown />
            </Button>
          </div>
          <div className="border-t border-white/5 bg-background/2 shrink-0 px-4 py-2.5">
            <ReplyingAttachmentContent
              formInput={formInput}
              setFormInput={setFormInput}
              inputRef={inputRef}
              isEditingMessage={isEditingMessage}
              setIsEditingMessage={setIsEditingMessage}
            />
            <form
              onSubmit={
                isEditingMessage.isEditing ? handleUpdate : handleSubmit
              }
              className="flex items-center gap-1"
            >
              <Button
                type="button"
                variant={"link"}
                onClick={() => inputRef.current?.click()}
              >
                <ImageIcon />
              </Button>
              <Input
                type="file"
                multiple
                className="hidden"
                ref={inputRef}
                onChange={handleFileChange}
              />
              <div className="flex-1 flex items-center gap-3 bg-background border border-white/10 rounded-2xl focus-within:bg-background/8 transition shadow-xl shadow-chat-background/15">
                <Textarea
                  placeholder="Type a message..."
                  value={formInput.message}
                  onChange={(e) => {
                    setFormInput((prev) => ({
                      ...prev,
                      message: e.target.value,
                    }));
                    handleTyping(Number(id));
                  }}
                  className="flex-1 bg-transparent text-sm dark:text-white placeholder-white/20 focus:outline-none resize-none max-h-50 wrap-break-word"
                  onKeyUp={handleOnKeyUp}
                  onKeyDown={(e) =>
                    e.key === "Enter" && !e.shiftKey && e.preventDefault()
                  }
                  ref={textAreaRef}
                />
              </div>
              <Button
                type="submit"
                disabled={
                  (!formInput.message.trim() &&
                    formInput.attachments.length <= 0) ||
                  isSubmitting ||
                  isLoading
                }
                className="self-end w-11 h-11 rounded-2xl bg-chat-background flex items-center justify-center shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              >
                <SendHorizonal />
              </Button>
            </form>
          </div>
        </>
      )}
      <AlertDialog
        open={isDeletingMessage.isDeleting}
        onOpenChange={(open) =>
          setIsDeletingMessage((prev) => ({ ...prev, isDeleting: open }))
        }
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              message.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction asChild>
              <ButtonLoader
                type="button"
                onClick={handleDeleteMessage}
                isLoading={isDeletingMessage.isLoadingDelete}
              >
                Delete
              </ButtonLoader>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default withAuthPage(ChatsPage, CAN_ACCESS_ALL);
