"use client";

import DataTableComponent from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchInput from "@/components/ui/search-input";
import { SEARCH_FILTER } from "@/constants/filter-by";
import { CAN_ACCESS_ALL, ROLE } from "@/constants/roles";
import { useChat } from "@/context/chat-context";
import useFetch from "@/hooks/use-fetch";
import { api } from "@/lib/api";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { MessageCircleMore, Users2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

function ChatsPage() {
  const { setMessageReceivedCount, messageRecords } = useChat();
  const {
    data,
    isLoading,
    handleSearchTerm,
    handlePageChange,
    handlePerPageChange,
    filterBy,
    pagination,
    handleShort,
    setIsRefresh,
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

  const USERS_COLUMNS = [
    {
      name: "User Name",
      selector: (row: any) => row.full_name,
    },
    {
      name: "Total Unseen Messages",
      cell: (row: any) => (
        <Badge variant={"destructive"} className="rounded-full">
          {messageRecords.find((record) => record.login_id === row.login_id)
            ?.message_count ?? 0}
        </Badge>
      ),
    },
    {
      name: "Last Message",
      selector: (row: any) =>
        messageRecords.find((record) => record.login_id === row.login_id)
          ?.last_message ?? row?.last_message,
      width: "250px",
    },
    {
      name: "Action",
      cell: (row: any) => (
        <Link
          href={`/chats/${row.login_id}`}
          className="flex gap-1 text-blue-500 hover:text-blue-600"
          onClick={
            (messageRecords.find((record) => record.login_id === row.login_id)
              ?.message_count ?? 0) > 0
              ? handleFlushUnseenMessages(row.login_id)
              : undefined
          }
        >
          <MessageCircleMore /> <span>Chat Now</span>
        </Link>
      ),
      sortable: false,
    },
  ];

  const handleFlushUnseenMessages = (id: number) => async () => {
    await api.delete(`unseen-message/${id}/flush`);
  };

  return (
    <div className="flex flex-col gap-3 m-7">
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between py-2 px-6">
          <CardTitle className="font-bold text-lg dark:text-white text-gray-600 flex items-center gap-1">
            <Users2 size={18} />
            <span>Users</span>
          </CardTitle>
          <div>
            <SearchInput onChange={handleSearchTerm(1000)} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={USERS_COLUMNS}
            loading={isLoading}
            handlePageChange={handlePageChange}
            handlePerPageChange={handlePerPageChange}
            handleShort={handleShort}
            column={pagination.sortBy}
            direction={pagination.sortDirection}
            pageTotal={pagination.totalRecords}
            searchTerm={filterBy.search}
            perPage={pagination.perPage}
            currentPage={pagination.page}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuthPage(ChatsPage, CAN_ACCESS_ALL);
