"use client";

import { Pagination } from "@/components/pagination";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import SearchInput from "@/components/ui/search-input";
import { Skeleton } from "@/components/ui/skeleton";
import { SEARCH_FILTER } from "@/constants/filter-by";
import { CAN_ACCESS_ALL } from "@/constants/roles";
import { useChat } from "@/context/chat-context";
import useFetch from "@/hooks/use-fetch";
import { api } from "@/lib/api";
import withAuthPage from "@/lib/hoc/with-auth-page";
import nameShortHand from "@/utils/name-short-hand";
import Storage from "@/utils/storage";
import {
  Check,
  MessageCircleMore,
  MessageCircleOff,
  Pointer,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { toast } from "sonner";

function ChatsPage() {
  const { setMessageReceivedCount, messageRecords, handlePoked, usersOnline } =
    useChat();
  const [poked, setPoked] = useState<{ [key: number]: boolean }>({});
  const {
    data,
    isLoading,
    handleSearchTerm,
    setIsRefresh,
    paginationLinks,
    handlePrevPage,
    handleNextPage,
    handleJumpToPage,
    pagination,
  } = useFetch({
    url: "/chats",
    isPaginated: true,
    filters: SEARCH_FILTER,
  });

  useEffect(() => {
    setMessageReceivedCount(0);
  }, []);

  useEffect(() => {
    setIsRefresh(true);
  }, [messageRecords]);

  const handleFlushUnseenMessages = (id: number) => async () => {
    await api.delete(`unseen-message/${id}/flush`);
  };

  const users: any[] = data?.data?.data ?? [];

  return (
    <div className="flex flex-col gap-3 m-7">
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between py-2 px-6">
          <CardTitle className="font-bold text-lg dark:text-white text-gray-600 flex items-center gap-1">
            <Users2 size={18} />
            <span>Conversations</span>
          </CardTitle>
          <div>
            <SearchInput onChange={handleSearchTerm(1000)} />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading || pagination.isLoading ? (
            <div className="divide-y">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 px-6 py-4">
                  <Skeleton className="w-10 h-10 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-3 w-32 rounded" />
                    <Skeleton className="h-2.5 w-48 rounded" />
                  </div>
                </div>
              ))}
            </div>
          ) : users.length === 0 ? (
            <Empty>
              <EmptyHeader>
                <EmptyMedia>
                  <MessageCircleOff className="size-12 text-muted-foreground/40" />
                </EmptyMedia>
                <EmptyTitle>No conversations found.</EmptyTitle>
                <EmptyDescription>
                  Conversation with users will appear here. Start by searching
                  for a user to chat
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : (
            <ul className="divide-y">
              {users.map((row: any) => {
                const record = messageRecords.find(
                  (r) => r.login_id === row.login_id,
                );
                const unread = record?.message_count ?? 0;
                const lastMessage = record?.last_message ?? row?.last_message;
                const isOnline = usersOnline.some((u) => u.id === row.login_id);
                const isPoked = poked[row.login_id];

                return (
                  <li
                    key={row.login_id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-muted/40 transition-colors"
                  >
                    <Link
                      href={`/chats/${row.login_id}`}
                      onClick={
                        unread > 0
                          ? handleFlushUnseenMessages(row.login_id)
                          : undefined
                      }
                      className="flex items-center gap-3 flex-1 min-w-0"
                    >
                      <div className="relative shrink-0">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={Storage(row.profile_pic)} />
                          <AvatarFallback className="font-semibold">
                            {nameShortHand(row?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        {isOnline && (
                          <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full ring-2 ring-background" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex gap-1 items-center">
                            <span
                              className={`text-sm truncate ${unread > 0 ? "font-semibold" : "font-medium"}`}
                            >
                              {row.full_name}
                            </span>
                            {unread > 0 && (
                              <span className="shrink-0 bg-destructive text-white text-destructive-foreground text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                                {unread}
                              </span>
                            )}
                          </div>
                        </div>
                        {lastMessage && (
                          <p
                            className={`text-xs truncate ${unread > 0 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                          >
                            {lastMessage}
                          </p>
                        )}
                      </div>
                    </Link>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-blue-500 hover:text-blue-600 px-2"
                      >
                        <Link
                          href={`/chats/${row.login_id}`}
                          onClick={
                            unread > 0
                              ? handleFlushUnseenMessages(row.login_id)
                              : undefined
                          }
                        >
                          <MessageCircleMore size={16} />
                        </Link>
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={isPoked}
                        className={`px-2 ${isPoked ? "text-green-500" : ""}`}
                        onClick={() => {
                          handlePoked(row.login_id)();
                          setPoked((prev) => ({
                            ...prev,
                            [row.login_id]: true,
                          }));
                          setTimeout(
                            () =>
                              setPoked((prev) => ({
                                ...prev,
                                [row.login_id]: false,
                              })),
                            5000,
                          );
                          toast.success("Poked!", {
                            position: "bottom-center",
                            description: "Successfully poked!",
                          });
                        }}
                      >
                        {isPoked ? <Check size={16} /> : <Pointer size={16} />}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
          <Pagination
            links={paginationLinks}
            handlePrevPage={handlePrevPage}
            handleNextPage={handleNextPage}
            handleJumpToPage={handleJumpToPage}
            isLoading={pagination.isLoading || isLoading}
            noData={users?.length === 0}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuthPage(ChatsPage, CAN_ACCESS_ALL);
