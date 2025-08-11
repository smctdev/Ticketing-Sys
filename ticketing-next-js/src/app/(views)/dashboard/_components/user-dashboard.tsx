import DataTableComponent from "@/components/data-table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Ticket,
  TicketCheckIcon,
  TicketPlusIcon,
  TicketsIcon,
  TicketXIcon,
} from "lucide-react";
import RecentTicketTransactions from "./recent-edited-ticket-transactions";
import { userDashboardColumns } from "../_constants/user-dashboard-table";

export default function UserDashboard({
  data,
  isLoading,
}: {
  data: any;
  isLoading: boolean;
}) {
  const ticketDetails = {
    totalTickets: data?.total_tickets,
    totalEditedTickets: data?.total_edited_tickets,
    totalRejectedTickets: data?.total_rejected_tickets,
    totalPendingTickets: data?.total_pending_tickets,
  };

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <Card className="relative border-l-5 min-h-30 hover:bg-green-50 border-l-green-500 hover:border-l-green-600 shadow hover:scale-103 hover:shadow-lg transition-all duration-300 ease-in-out">
            <CardContent className="z-1">
              <CardTitle className="text-md font-bold text-gray-600">
                Total Tickets
              </CardTitle>
              <CardDescription className="font-bold text-3xl">
                {isLoading ? (
                  <Skeleton className="h-10 w-10" />
                ) : (
                  ticketDetails.totalTickets
                )}
              </CardDescription>
            </CardContent>
            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              <TicketsIcon size={85} className="text-slate-200" />
            </div>
          </Card>
          <Card className="relative border-l-5 min-h-30 hover:bg-blue-50 border-l-blue-500 hover:border-l-blue-600 shadow hover:scale-103 hover:shadow-lg transition-all duration-300 ease-in-out">
            <CardContent className="z-1">
              <CardTitle className="text-md font-bold text-gray-600">
                Total Edited Tickets
              </CardTitle>
              <CardDescription className="font-bold text-3xl">
                {isLoading ? (
                  <Skeleton className="h-10 w-10" />
                ) : (
                  ticketDetails.totalEditedTickets
                )}
              </CardDescription>
            </CardContent>
            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              <TicketCheckIcon size={85} className="text-slate-200" />
            </div>
          </Card>
          <Card className="relative border-l-5 min-h-30 hover:bg-red-50 border-l-red-500 hover:border-l-red-600 shadow hover:scale-103 hover:shadow-lg transition-all duration-300 ease-in-out">
            <CardContent className="z-1">
              <CardTitle className="text-md font-bold text-gray-600">
                Total Rejected Tickets
              </CardTitle>
              <CardDescription className="font-bold text-3xl">
                {isLoading ? (
                  <Skeleton className="h-10 w-10" />
                ) : (
                  ticketDetails.totalRejectedTickets
                )}
              </CardDescription>
            </CardContent>
            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              <TicketXIcon size={85} className="text-slate-200" />
            </div>
          </Card>
          <Card className="relative border-l-5 min-h-30 hover:bg-yellow-50 border-l-yellow-500 hover:border-l-yellow-600 shadow hover:scale-103 hover:shadow-lg transition-all duration-300 ease-in-out">
            <CardContent className="z-1">
              <CardTitle className="text-md font-bold text-gray-600">
                Total Pending Tickets
              </CardTitle>
              <CardDescription className="font-bold text-3xl">
                {isLoading ? (
                  <Skeleton className="h-10 w-10" />
                ) : (
                  ticketDetails.totalPendingTickets
                )}
              </CardDescription>
            </CardContent>
            <div className="absolute top-1/2 right-2 -translate-y-1/2">
              <TicketPlusIcon size={85} className="text-slate-200" />
            </div>
          </Card>
        </div>
        <div className="w-full">
          <div className="flex flex-col lg:flex-row gap-5">
            <div className="w-12/12 lg:w-3/5">
              <Card className="shadow-sm hover:shadow-md transition-all duration-200">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <Ticket size={18} />
                    Recent Tickets
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DataTableComponent
                    data={data?.data?.data}
                    columns={userDashboardColumns}
                    loading={isLoading}
                  />
                </CardContent>
              </Card>
            </div>
            <div className="w-12/12 lg:w-2/5">
              <RecentTicketTransactions
                recentTickets={data?.recent_tickets}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
