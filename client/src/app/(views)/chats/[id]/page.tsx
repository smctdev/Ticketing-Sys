"use client";

import { ChatSkeleton } from "@/components/chat-skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import ButtonLoader from "@/components/ui/button-loader";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { CAN_ACCESS_ALL } from "@/constants/roles";
import { useAuth } from "@/context/auth-context";
import { useChat } from "@/context/chat-context";
import { useSimple } from "@/hooks/use-simple";
import { api } from "@/lib/api";
import withAuthPage from "@/lib/hoc/with-auth-page";
import formattedDateAndTimeStrict from "@/utils/format-date-time-strict";
import nameShortHand from "@/utils/name-short-hand";
import Storage from "@/utils/storage";
import {
  ArrowDown,
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
import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";

export type MessageType = {
  id: number;
  sender_id: number;
  receiver_id: number;
  body: string;
  created_at: Date;
};

function ChatsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data, isLoading, errorStatus, handleNextPage, loadMore } = useSimple(
    `/chats/${id}`,
  );
  const searchParams = useSearchParams();
  const ticketCode = Number(searchParams.get("ticket_code")) || "";
  const { newMessage, setMessageRecords } = useChat();
  const [message, setMessage] = useState<string>(
    ticketCode
      ? `Hello, let's discuss the ticket with code #${ticketCode}?`
      : "",
  );
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
      const response = await api.post(`/chats`, {
        body: message,
        receiver_id: Number(id),
      });

      if (response.status === 201) {
        setMessage("");
        setMessages((prev) => [response.data.data, ...prev]);
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOnKeyUp = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (!e.shiftKey && e.key === "Enter" && message.trim() && !isSubmitting) {
      handleSubmit(e);
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
              className="space-y-4 flex flex-col-reverse px-6 py-4 overflow-y-auto h-full w-full"
              ref={convoRef}
            >
              {messages?.length > 0 ? (
                <>
                  {messages.map((message: MessageType) => (
                    <div key={message?.id}>
                      {message?.sender_id === user?.login_id ? (
                        <div className="flex justify-end items-end gap-2">
                          <div className="max-w-4/5">
                            <div
                              className="px-4 py-2.5 rounded-2xl rounded-br-sm text-sm wrap-break-word whitespace-break-spaces leading-relaxed bg-chat-background dark:text-white shadow-lg shadow-chat-background/50"
                              dangerouslySetInnerHTML={{
                                __html: message?.body,
                              }}
                            />
                            <p className="text-[10px] dark:text-white/20 mt-1 text-right">
                              {formattedDateAndTimeStrict(message?.created_at)}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-start items-end gap-2">
                          <Avatar className="w-7 h-7 shrink-0 mb-1">
                            <AvatarImage
                              src={Storage(data?.user?.profile_pic)}
                            />
                            <AvatarFallback className="text-xs font-bold">
                              {nameShortHand(data?.user?.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="max-w-4/5">
                            <div
                              className="px-4 py-2.5 rounded-2xl rounded-bl-sm text-sm wrap-break-word whitespace-break-spaces bg-chat-receiver-background leading-relaxed dark:text-white border border-white/10 backdrop-blur-sm shadow-lg shadow-chat-receiver-background/50"
                              dangerouslySetInnerHTML={{
                                __html: message?.body,
                              }}
                            />
                            <p className="text-[10px] dark:text-white/20 mt-1">
                              {formattedDateAndTimeStrict(message?.created_at)}
                            </p>
                          </div>
                        </div>
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
          <div className="border-t border-white/5 bg-background/2 shrink-0">
            <form
              onSubmit={handleSubmit}
              className="flex items-center px-4 py-2.5 gap-1"
            >
              <div className="flex-1 flex items-center gap-3 bg-background border border-white/10 rounded-2xl focus-within:bg-background/8 transition shadow-xl shadow-chat-background/15">
                <Textarea
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
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
                disabled={!message.trim() || isSubmitting || isLoading}
                className="self-end w-11 h-11 rounded-2xl bg-chat-background flex items-center justify-center shadow-lg shadow-violet-500/25 transition-all hover:-translate-y-0.5 active:translate-y-0 shrink-0"
              >
                <SendHorizonal />
              </Button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default withAuthPage(ChatsPage, CAN_ACCESS_ALL);
