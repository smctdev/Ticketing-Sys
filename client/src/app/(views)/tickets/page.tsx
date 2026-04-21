"use client";

import DataTableComponent from "@/components/data-table";
import useFetch from "@/hooks/use-fetch";
import { TICKETS_COLUMNS } from "../dashboard/_constants/tickets-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ArrowLeftRight,
  Eye,
  Funnel,
  Hand,
  Pencil,
  Ticket,
} from "lucide-react";
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
import { canCreateTicket } from "@/utils/permissions";
import SearchInput from "@/components/ui/search-input";
import { useEffect, useState } from "react";
import echo from "@/lib/echo";
import { EditTicket } from "./_components/edit-ticket";
import { DeleteTicket } from "./_components/delete-ticket";
import { toast } from "sonner";
import { Tooltip, TooltipContent } from "@/components/ui/tooltip";
import { TooltipArrow, TooltipTrigger } from "@radix-ui/react-tooltip";
import { useIsRefresh } from "@/context/is-refresh-context";
import { TransferTicketToAutomation } from "./_components/transfer-ticket-to-automation";
import { Label } from "@/components/ui/label";
import Swal from "sweetalert2";
import { isAccountingStaff, isAutomation } from "@/utils/is-approvers";
import { api } from "@/lib/api";
import { TICKET_STATUS } from "@/constants/ticket-status";
import ButtonLoader from "@/components/ui/button-loader";
import { CAN_ACCESS_ALL } from "@/constants/roles";

function Tickets() {
  const { user, isAdmin } = useAuth();
  const { isRefresh, setIsRefresh: refresh } = useIsRefresh();
  const [ticketType, setTicketType] = useState<
    "netsuite_ticket" | "sql_ticket"
  >("netsuite_ticket");
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
    setIsLoading,
    isRefresh: isRefreshTickets,
  } = useFetch({
    url: "/tickets",
    isPaginated: true,
    filters: TICKETS_FILTER,
    canBeRefreshGlobal: isRefresh,
  });
  const {
    data: categories,
    isLoading: isLoadingCategories,
    setIsRefresh: setIsRefreshCategories,
  } = useFetch({
    url: `/categories?category_type=${ticketType}`,
  });
  const {
    data: branchHeads,
    isLoading: isLoadingBranchHeads,
    setIsRefresh: setIsRefreshBranchHeads,
  } = useFetch({
    url: `user-branch-heads`,
  });
  const [selectedTicketData, setSelectedTicketData] = useState<null | any>(
    null,
  );
  const [isOpenDialog, setIsOpenDialog] = useState<boolean>(false);
  const [isOpenView, setIsOpenView] = useState<boolean>(false);
  const [isOpenToTransfer, setIsOpenToTransfer] = useState<boolean>(false);
  const [error, setError] = useState<any>(null);
  const [note, setNote] = useState<string>("");
  const [isCounted, setIsCounted] = useState<string>("");
  const role = user?.user_role?.role_name;

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
      echo.leave(`approver-of-ticket-${user?.login_id}`);
      echo.leave("ticket-deleted");
    };
  }, [echo, user, selectedTicketData]);

  const isTurnToApprove = (userId: number | string | null) => {
    return userId === user?.login_id;
  };

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
                {isTurnToApprove(row?.pending_user?.login_id) &&
                row?.status !== TICKET_STATUS.REJECTED ? (
                  <Hand className="h-4 w-4 text-blue-500 hover:text-blue-600" />
                ) : (
                  <Eye className="h-4 w-4 text-green-500 hover:text-green-600" />
                )}
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <TooltipArrow />
              {isTurnToApprove(row?.pending_user?.login_id)
                ? "Approve Ticket"
                : "View Ticket"}
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
            <DeleteTicket data={row} setIsRefresh={setIsRefresh} />
          )}
          {isAdmin && (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="border-none bg-transparent shadow-none hover:scale-105"
                  onClick={handleDialogOpen(row, "transfer")}
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

    switch (type) {
      case "edit":
        setIsOpenDialog(true);
        break;
      case "view":
        setIsOpenView(true);
        break;
      case "transfer":
        setIsOpenToTransfer(true);
        break;
    }
  };

  const handleEditTicket =
    (ticketCode: string | number, ticketDetailsId: string | number) => () => {
      setIsOpenView(false);
      Swal.fire({
        title: "Mark as edit ticket",
        text: `Are you sure you want to mark as edit this ticket with ticket code of "${ticketCode}"?`,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, mark as edit it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          refresh(true);
          Swal.fire({
            title: "Marking as edit...",
            text: "Please wait while the ticket is being marking as edit...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const formData = isAutomation(role)
            ? {
                td_note_bh: note,
                is_counted: isCounted,
              }
            : {
                td_note: note,
              };

          try {
            const response = await api.patch(
              `/mark-as-edited-ticket/${ticketDetailsId}/mark-as-edited`,
              formData,
            );
            if (response.status === 200) {
              setIsOpenView(false);
              toast.success("Success", {
                description: response.data.message,
                position: "bottom-center",
              });
              setNote("");
              setError(null);
              setIsCounted("");
              Swal.close();
            }
          } catch (error: any) {
            console.error(error);
            if (error.response.status === 422) {
              setError(error.response.data.errors);
              Swal.close();
              setIsOpenView(true);
            } else if (
              error.response &&
              [404, 500, 502, 503, 504].includes(error.response.status)
            ) {
              const message =
                error.response.data.message ||
                "Something went wrong marking as edit the ticket!";
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: message,
              });
              setError(null);
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong marking as edit the ticket!",
              });
              setError(null);
            }
          } finally {
            refresh(false);
          }
        } else {
          setIsOpenView(true);
        }
      });
    };

  const handleApproveTicket =
    (ticketCode: string | number, ticketDetailsId: string | number) => () => {
      setIsOpenView(false);
      Swal.fire({
        title: "Approve Ticket",
        text: `Are you sure you want to approve this ticket with ticket code of "${ticketCode}"?`,
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, approve it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          refresh(true);
          Swal.fire({
            title: "Approving...",
            text: "Please wait while the ticket is being approve...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const formData = isAutomation(role)
            ? {
                td_note_bh: note,
              }
            : {
                td_note: note,
              };

          try {
            const response = await api.patch(
              `/approve-ticket/${ticketDetailsId}/approve`,
              formData,
            );
            if (response.status === 200) {
              setIsOpenView(false);
              toast.success("Success", {
                description: response.data.message,
                position: "bottom-center",
              });
              setNote("");
              setError(null);
              Swal.close();
            }
          } catch (error: any) {
            console.error(error);
            if (error.response.status === 422) {
              setError(error.response.data.errors);
              Swal.close();
              setIsOpenView(true);
            } else if (error.response.status === 400) {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: error.response.data.message,
              });
              setError(null);
            } else if (
              error.response &&
              [404, 500, 502, 503, 504].includes(error.response.status)
            ) {
              const message =
                error.response.data.message ||
                "Something went wrong approving the ticket!";
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: message,
              });
              setError(null);
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong approving the ticket!",
              });
              setError(null);
            }
          } finally {
            refresh(false);
          }
        } else {
          setIsOpenView(true);
        }
      });
    };

  const handleReviseTicket =
    (ticketCode: string | number, ticketDetailsId: string | number) => () => {
      setIsOpenView(false);
      Swal.fire({
        title: "Revise Ticket",
        text: `Are you sure you want to revise this ticket with ticket code of "${ticketCode}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, revise it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          refresh(true);
          Swal.fire({
            title: "Revising...",
            text: "Please wait while the ticket is being revised...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          const formData = isAutomation(role)
            ? {
                td_note_bh: note,
              }
            : isAccountingStaff(role)
              ? {
                  td_note_accounting: note,
                }
              : {
                  td_note: note,
                };

          try {
            const response = await api.patch(
              `/revise-ticket/${ticketDetailsId}/revise`,
              formData,
            );
            if (response.status === 200) {
              setIsOpenView(false);
              toast.success("Success", {
                description: response.data.message,
                position: "bottom-center",
              });
              setNote("");
              setError(null);
              Swal.close();
            }
          } catch (error: any) {
            console.error(error);
            if (error.response.status === 422) {
              setError(error.response.data.errors);
              Swal.close();
              setIsOpenView(true);
            } else if (
              error.response &&
              [404, 500, 502, 503, 504].includes(error.response.status)
            ) {
              const message =
                error.response.data.message ||
                "Something went wrong revising the ticket!";
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: message,
              });
              setError(null);
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong revising the ticket!",
              });
              setError(null);
            }
          } finally {
            refresh(false);
          }
        } else {
          setIsOpenView(true);
        }
      });
    };

  const handleDirectToAutomation =
    (ticketCode: string | number, ticketDetailsId: string | number) => () => {
      setIsOpenView(false);
      Swal.fire({
        title: "Direct to Automation Ticket",
        text: `Are you sure you want to direct this ticket to automation with ticket code of "${ticketCode}"?`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, direct it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          refresh(true);
          Swal.fire({
            title: "Directing to automation...",
            text: "Please wait while the ticket is being directing to automation...",
            allowOutsideClick: false,
            didOpen: () => {
              Swal.showLoading();
            },
          });

          try {
            const response = await api.post(
              `/direct-to-automation-ticket/${ticketDetailsId}/direct-to-automation`,
            );
            if (response.status === 200) {
              setIsOpenView(false);
              toast.success("Success", {
                description: response.data.message,
                position: "bottom-center",
              });
              setNote("");
              setError(null);
              Swal.close();
            }
          } catch (error: any) {
            console.error(error);
            if (error.response.status === 422) {
              setError(error.response.data.errors);
              Swal.close();
              setIsOpenView(true);
            } else if (
              error.response &&
              [404, 500, 502, 503, 504].includes(error.response.status)
            ) {
              const message =
                error.response.data.message ||
                "Something went wrong directing the ticket to automation!";
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: message,
              });
              setError(null);
            } else {
              Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "Something went wrong directing the ticket to automation!",
              });
              setError(null);
            }
          } finally {
            refresh(false);
          }
        } else {
          setIsOpenView(true);
        }
      });
    };

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader>
          <CardTitle className="font-bold text-lg dark:text-white text-gray-600 flex items-center gap-1">
            <Funnel size={18} />
            <span>Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="status" className="px-1">
                Filter by status
              </Label>
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
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="ticket_type" className="px-1">
                Filter by ticket type
              </Label>
              <Select
                onValueChange={handleSelectFilter("ticket_type")}
                value={filterBy.ticket_type}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by ticket type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="Filter by ticket type" disabled>
                      Filter by ticket type
                    </SelectItem>
                    <SelectItem value="ALL">ALL</SelectItem>
                    <SelectItem value="netsuite_ticket">
                      Netsuite Ticket
                    </SelectItem>
                    <SelectItem value="sql_ticket">SQL Ticket</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2 col-span-2 lg:col-span-1">
              <Label htmlFor="search" className="px-1">
                Search
              </Label>
              <SearchInput
                onChange={handleSearchTerm(1000)}
                value={filterBy.defaultSearchValue}
              />
            </div>
          </div>
          <Button
            type="button"
            onClick={handleReset}
            variant="ghost"
            className="bg-yellow-400 text-white hover:bg-yellow-500 hover:text-white mt-2 float-end"
          >
            Reset
          </Button>
        </CardContent>
      </Card>
      <Card className="gap-0">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="font-bold text-lg dark:text-white text-gray-600 flex items-center gap-1">
              <Ticket size={18} />
              <span>Requested Tickets</span>
            </CardTitle>
            <div className="flex gap-1">
              <div>
                <ButtonLoader
                  type="button"
                  className="bg-yellow-500 hover:bg-yellow-600"
                  isLoading={isRefreshTickets}
                  onClick={() => {
                    setIsRefresh(true);
                    setIsRefreshBranchHeads(true);
                  }}
                >
                  Refresh
                </ButtonLoader>
              </div>
              {canCreateTicket(user?.user_role?.role_name) && (
                <CreateTicket
                  setIsRefresh={setIsRefresh}
                  categories={categories}
                  user={user}
                  setTicketType={setTicketType}
                  setIsRefreshCategories={setIsRefreshCategories}
                  branchHeads={branchHeads?.data}
                  setIsRefreshBranchHeads={setIsRefreshBranchHeads}
                />
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={[...TICKETS_COLUMNS, ...TICKET_COLUMNS_ACTIONS]}
            loading={isLoading || isRefreshTickets}
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

      {isOpenDialog && (
        <EditTicket
          setIsRefresh={setIsRefresh}
          ticketData={selectedTicketData}
          categories={categories}
          user={user}
          setIsOpenDialog={setIsOpenDialog}
          open={isOpenDialog}
          setTicketType={setTicketType}
          setIsRefreshCategories={setIsRefreshCategories}
          branchHeads={branchHeads?.data}
          setIsRefreshBranchHeads={setIsRefreshBranchHeads}
        />
      )}

      {isOpenView && (
        <ViewTicketDetails
          data={selectedTicketData}
          open={isOpenView}
          setOpen={setIsOpenView}
          setNote={setNote}
          setIsCounted={setIsCounted}
          role={role}
          note={note}
          error={error}
          isCounted={isCounted}
          handleApproveTicket={handleApproveTicket}
          handleEditTicket={handleEditTicket}
          handleReviseTicket={handleReviseTicket}
          handleDirectToAutomation={handleDirectToAutomation}
        />
      )}

      {isOpenToTransfer && (
        <TransferTicketToAutomation
          data={selectedTicketData}
          open={isOpenToTransfer}
          setOpen={setIsOpenToTransfer}
        />
      )}
    </div>
  );
}

export default withAuthPage(Tickets, CAN_ACCESS_ALL);
