"use client";

import DataTableComponent from "@/components/data-table";
import useFetch from "@/hooks/use-fetch";
import { TICKETS_COLUMNS } from "../dashboard/_constants/tickets-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeftRight, Eye, Funnel, Pencil, Ticket } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ViewTicketDetails } from "./_components/view-ticket-details";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { TICKETS_FILTER } from "@/constants/filter-by";
import { CreateTicket } from "./_components/create-ticket";
import { useAuth } from "@/context/auth-context";
import { canCreateTicket } from "@/constants/can-create-ticket";
import SearchInput from "@/components/ui/search-input";
import { useEffect, useState } from "react";
import echo from "@/lib/echo";
import { EditTicket } from "./_components/edit-ticket";
import { DeleteTicket } from "./_components/delete-ticket";
import { toast } from "sonner";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipArrow, TooltipTrigger } from "@radix-ui/react-tooltip";
import { useIsRefresh } from "@/context/is-refresh-context";

function Tickets() {
  const { user, isAdmin } = useAuth();
  const { isRefresh } = useIsRefresh();
  const {
    data,
    isLoading,
    handleSearchTerm,
    handlePageChange,
    handlePerPageChange,
    handleShort,
    filterBy,
    pagination,
    handleSelectFilter,
    handleReset,
    setIsRefresh,
  } = useFetch({
    url: "/tickets",
    isPaginated: true,
    filters: TICKETS_FILTER,
    canBeRefreshGlobal: isRefresh,
  });
  const { data: categories, isLoading: isLoadingCategories } = useFetch({
    url: "/categories",
  });
  const [selectedTicketData, setSelectedTicketData] = useState<null | any>(
    null
  );
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [isOpenView, setIsOpenView] = useState<boolean>(false);

  useEffect(() => {
    if (!echo || !user) return;

    echo
      .private(`approver-of-ticket-${user?.login_id}`)
      .notification((notification: any) => {
        setIsRefresh(true);
      });

    echo.channel("ticket-deleted").listen("DeleteTicketEvent", (event: any) => {
      if (selectedTicketData?.ticket_code === event.ticket_code) {
        toast.info("Ticket Deleted", {
          description: "Ops! This ticket was deleted by user.",
          position: "top-center",
        });
        setIsOpenDialog(false);
        setIsOpenView(false);
      }
      setIsRefresh(true);
    });

    return () => {
      echo.leave(`private-approver-of-ticket-${user?.login_id}`);
      echo.leave("ticket-deleted");
    };
  }, [echo, user, selectedTicketData]);

  const TICKET_COLUMNS_ACTIONS = [
    {
      name: "Action",
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleDialogOpen(row, "view")}
                className="border-none bg-transparent shadow-none hover:scale-105"
              >
                <Eye className="h-4 w-4 text-green-500 hover:text-green-600" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <TooltipArrow />
              View Ticket
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              {user?.login_id === row?.login_id && (
                <button
                  type="button"
                  className="border-none bg-transparent shadow-none hover:scale-105"
                  onClick={handleDialogOpen(row, "edit")}
                >
                  <Pencil className="h-4 w-4 text-blue-500 hover:text-blue-600" />
                </button>
              )}
            </TooltipTrigger>
            <TooltipContent>
              <TooltipArrow />
              Edit Ticket
            </TooltipContent>
          </Tooltip>
          {(user?.login_id === row?.login_id || isAdmin) && (
            <DeleteTicket data={row} />
          )}
          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="border-none bg-transparent shadow-none hover:scale-105"
                  onClick={handleDialogOpen(row, "delete")}
                >
                  <ArrowLeftRight className="h-4 w-4 text-green-500 hover:text-green-600" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <TooltipArrow />
                Transfer Ticket
              </TooltipContent>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const handleDialogOpen = (data: any, type: string) => () => {
    setSelectedTicketData(data);
    if (type === "view") {
      setIsOpenView(true);
    } else {
      setIsOpenDialog(true);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader>
          <CardTitle className="font-bold text-lg text-gray-600 flex items-center gap-1">
            <Funnel size={18} />
            <span>Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex gap-2 justify-evenly">
            <Select
              onValueChange={handleSelectFilter("status")}
              value={filterBy.status}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Filter by status" disabled>
                    Filter by status
                  </SelectItem>
                  <SelectItem value="ALL">ALL</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <SearchInput
              onChange={handleSearchTerm(1000)}
              value={filterBy.defaultSearchValue}
            />
            <Button
              type="button"
              onClick={handleReset}
              variant="ghost"
              className="bg-yellow-400 text-white hover:bg-yellow-500 hover:text-white"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="gap-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold text-lg text-gray-600 flex items-center gap-1">
              <Ticket size={18} />
              <span>Requested Tickets</span>
            </CardTitle>
            {canCreateTicket(user?.user_role?.role_name) && (
              <CreateTicket
                setIsRefresh={setIsRefresh}
                categories={categories}
                user={user}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={[...TICKETS_COLUMNS, ...TICKET_COLUMNS_ACTIONS]}
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

      <EditTicket
        setIsRefresh={setIsRefresh}
        ticketData={selectedTicketData}
        categories={categories}
        user={user}
        setIsOpenDialog={setIsOpenDialog}
        open={isOpenDialog}
      />

      <ViewTicketDetails
        data={selectedTicketData}
        open={isOpenView}
        setOpen={setIsOpenView}
      />
    </div>
  );
}

export default withAuthPage(Tickets);
