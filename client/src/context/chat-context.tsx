"use client";

import echo from "@/lib/echo";
import {
  ChangeEvent,
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useAuth } from "./auth-context";
import { MessageType } from "@/app/(views)/chats/[id]/page";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";

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
  usersOnline: UsersOnlineType[];
  typing: TypingType;
  notify: NotifyType;
  setNotify: Dispatch<SetStateAction<NotifyType>>;
  handleTyping: (target_id: number) => void;
  handleSendNotify: () => void;
};

export type UsersOnlineType = {
  id: number;
  full_name: string;
  timestamp: Date;
};

export type TypingType = {
  target_id: number | null;
  user: string | null;
  isTyping: boolean;
  typer_id: number | null;
};

export type NotifyType = {
  isOpen: boolean;
  message: string;
  title: string;
  errors: {
    title?: string;
    message?: string;
  };
  notifyBy: string;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messageRecords, setMessageRecords] = useState<MessageRecordType[]>([]);
  const [messageReceivedCount, setMessageReceivedCount] = useState<number>(0);
  const [newMessage, setNewMessage] = useState<MessageType | null>(null);
  const [usersOnline, setUsersOnline] = useState<UsersOnlineType[]>([]);
  const [typing, setTyping] = useState<TypingType>({
    target_id: null,
    user: null,
    isTyping: false,
    typer_id: null,
  });
  const [notify, setNotify] = useState<NotifyType>({
    isOpen: false,
    message: "",
    title: "",
    errors: {},
    notifyBy: "",
  });
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const newData = useRef<MessageRecordType[]>([]);
  const typingRef = useRef<NodeJS.Timeout | null>(null);

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

      setMessageRecords((prev) => {
        const id = e.message.sender_id;
        const splitted = pathname.split("/");

        const existingItem = prev?.findIndex(
          (record) => record.login_id === id,
        );

        if (id === Number(splitted.pop())) return prev;

        if (existingItem !== -1) {
          newData.current = prev.map((record, index) =>
            index === existingItem
              ? {
                  ...record,
                  message_count: record.message_count + 1,
                  last_message: e.message.body || `Sent ${e.message.attachments?.length} attchment(s)`,
                }
              : record,
          );
        } else {
          newData.current = [
            ...prev,
            {
              login_id: id,
              last_message: e.message.body,
              message_count: 1,
            },
          ];
        }

        document.title = `(${newData.current?.length}) New message(s) arrived`;

        return newData.current;
      });
    });

    echo
      .join(`poked`)
      .listenForWhisper("poked", (e: any) => {
        if (e.target_id !== user?.login_id) return;

        toast.info("Poked!", {
          description: e.poked,
          position: "top-right",
          action: {
            label: "Chat Now",
            onClick: () => {
              router.replace(`/chats/${e.target_id}`);
            },
          },
          duration: 10000,
          closeButton: true,
        });
      })
      .listenForWhisper("typing", (e: any) => {
        if (e.target_id !== user?.login_id) return;

        setTyping({
          target_id: e.target_id,
          user: e.user,
          isTyping: e.isTyping,
          typer_id: e.typer_id,
        });
      })
      .listenForWhisper("notify", (e: any) => {
        setNotify({
          isOpen: e.isOpen,
          message: e.message,
          title: e.title,
          errors: e.errors || {},
          notifyBy: e.notifyBy,
        });
      })
      .here((e: any) => {
        setUsersOnline(e);
      })
      .joining((e: any) => {
        setUsersOnline((prev) => [e, ...prev]);
      })
      .leaving((e: any) => {
        setUsersOnline((prev) => [...prev.filter((user) => user.id !== e.id)]);
      });

    return () => {
      echo.leave(`private-${channelName}`);
      echo.leave(`presence-poked`);
    };
  }, [echo, user, pathname]);

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

  const handleTyping = (target_id: number) => {
    echo.join(`poked`).whisper("typing", {
      target_id,
      typer_id: user?.login_id,
      user: user?.full_name,
      isTyping: true,
    });

    if (typingRef.current) clearTimeout(typingRef.current);

    typingRef.current = setTimeout(() => {
      echo.join(`poked`).whisper("typing", {
        target_id,
        typer_id: user?.login_id,
        user: user?.full_name,
        isTyping: false,
      });
    }, 2000);
  };

  const handleSendNotify = () => {
    if (!notify.title || !notify.message) {
      let errors: any = {};

      if (!notify.title) {
        errors.title = "Title is required";
      }

      if (!notify.message) {
        errors.message = "Message is required";
      }

      setNotify((prev) => ({ ...prev, errors }));

      return;
    }

    echo.join(`poked`).whisper("notify", {
      isOpen: true,
      message: notify.message,
      title: notify.title,
      notifyBy: user?.full_name,
    });

    setNotify((prev) => ({ ...prev, title: "", message: "", errors: {} }));
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
        usersOnline,
        typing,
        notify,
        setNotify,
        handleTyping,
        handleSendNotify,
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
