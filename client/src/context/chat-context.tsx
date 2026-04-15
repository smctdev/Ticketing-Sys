"use client";

import echo from "@/lib/echo";
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useState,
} from "react";
import { useAuth } from "./auth-context";
import { MessageType } from "@/app/(views)/chats/[id]/page";
import { usePathname, useRouter } from "next/navigation";
import Swal from "sweetalert2";

type MessageRecordType = {
  login_id: number;
  last_message?: string;
  message_count: number;
};

type ChatContextType = {
  messageRecords: MessageRecordType[];
  setMessageRecords: Dispatch<SetStateAction<MessageRecordType[]>>;
  messageReceivedCount: number;
  setMessageReceivedCount: Dispatch<SetStateAction<number>>;
  newMessage: MessageType | null;
  handlePoked: (id: number) => () => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messageRecords, setMessageRecords] = useState<MessageRecordType[]>([]);
  const [messageReceivedCount, setMessageReceivedCount] = useState<number>(0);
  const [newMessage, setNewMessage] = useState<MessageType | null>(null);
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    setMessageReceivedCount(user.unread_messages_count);
    setMessageRecords(user.unread_messages);
  }, [user]);

  useEffect(() => {
    if (!echo || !user) return;
    const channelName = `chats.${user?.login_id}`;

    echo.private(channelName).listen("ChatEvent", (e: any) => {
      setNewMessage(e.message);

      if (e.message) {
        document.title = `(${messageRecords?.length}) New message(s) arrived`;
      }

      setMessageRecords((prev) => {
        const id = e.message.sender_id;
        const splitted = pathname.split("/");

        if (id === Number(splitted.pop())) return prev;

        const existingItem = prev.findIndex((record) => record.login_id === id);

        if (existingItem !== -1) {
          return prev.map((record, index) =>
            index === existingItem
              ? {
                  ...record,
                  message_count: record.message_count + 1,
                  last_message: e.message.body,
                }
              : record,
          );
        }

        return [
          ...prev,
          {
            login_id: id,
            last_message: e.message.body,
            message_count: 1,
          },
        ];
      });
    });

    echo.join(`poked`).listenForWhisper("poked", (e: any) => {
      if (e.target_id !== user?.login_id) return;
      Swal.fire({
        icon: "info",
        title: "Poked!",
        text: e.poked,
        confirmButtonText: "Chat Now",
        showCancelButton: true,
        cancelButtonText: "Maybe Later",
        allowOutsideClick: false,
        allowEscapeKey: false,
      }).then((result) => {
        if (result.isConfirmed) {
          router.replace(`/chats/${e.target_id}`);
        }
      });
    });

    return () => {
      echo.leave(`private-${channelName}`);
      echo.leave(`presence-poked`);
    };
  }, [echo, user, pathname, messageRecords]);

  useEffect(() => {
    setMessageReceivedCount(messageRecords?.length);
  }, [messageRecords]);

  const handlePoked = (id: number) => () => {
    if (!id) return;

    echo.join(`poked`).whisper("poked", {
      poked: `${user?.full_name} poked you and want to chat with you!`,
      target_id: id,
    });
  };

  return (
    <ChatContext.Provider
      value={{
        messageRecords,
        setMessageRecords,
        messageReceivedCount,
        setMessageReceivedCount,
        newMessage,
        handlePoked,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const ctx = useContext(ChatContext);

  if (!ctx) {
    throw new Error("useChat must be within ChatProvider");
  }

  return ctx;
}
