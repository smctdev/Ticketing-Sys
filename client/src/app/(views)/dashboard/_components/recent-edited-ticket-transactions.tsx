import RecentTicketTransactionsLoader from "@/components/loaders/recent-edited-ticket-transaction-loader";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import formatDateAndTime from "@/utils/format-date-and-time";
import statusColor from "@/utils/ticket-status-color";
import { Ticket } from "lucide-react";

export default function RecentEditedTicketTransactions({
  recentTickets,
  isLoading,
}: {
  recentTickets: any;
  isLoading: boolean;
}) {
  return (
    <Card className="shadow-sm hover:shadow-md transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="lg:text-sm text-lg xl:text-lg font-semibold flex items-center gap-2">
          <Ticket size={18} />
          Recent Edited Ticket Transactions
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            <RecentTicketTransactionsLoader />
          ) : recentTickets.length > 0 ? (
            recentTickets.map((ticket: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
              >
                <div className="space-y-2">
                  <p className="font-medium">
                    {ticket.ticket_code} -{" "}
                    {ticket.ticket_detail.ticket_category.category_name}
                  </p>
                  <p className="flex gap-1 items-center text-xs">
                    <span className="font-bold text-gray-600">Edited by: </span> <span>{ticket?.edited_by?.full_name}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    {formatDateAndTime(
                      ticket.ticket_detail.ticket_transaction_date
                    )}
                  </p>
                </div>
                <Badge
                  className={`border ${statusColor(ticket.status)} capitalize`}
                >
                  {ticket.status.toLowerCase()}
                </Badge>
              </div>
            ))
          ) : (
            <p className="text-center text-sm font-bold text-gray-600">
              No recent edited ticket transactions
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
