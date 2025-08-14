import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  ArrowDown,
  ArrowUp,
  Clock,
  Edit,
  Ticket,
  Users,
  X,
} from "lucide-react";

export default function TopCard({ data, totalTickets }: any) {
  return (
    <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
      <Card className="hover:shadow hover:bg-gray-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.total_users?.total_users}
          </div>
          <ScrollArea className="h-20">
            <div className="grid grid-cols-2 gap-2 mt-4">
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Staffs:</span>{" "}
                {data?.total_users?.total_staff}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Branch Heads:</span>{" "}
                {data?.total_users?.total_branch_head}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Accounting Heads:</span>{" "}
                {data?.total_users?.total_accounting_head}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Automations:</span>{" "}
                {data?.total_users?.total_automation}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Area Managers:</span>{" "}
                {data?.total_users?.total_area_manager}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">Accounting Staffs:</span>{" "}
                {data?.total_users?.total_accounting_staff}
              </div>
              <div className="text-xs text-muted-foreground">
                <span className="font-medium">CAS:</span>{" "}
                {data?.total_users?.total_cas}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="hover:shadow hover:bg-gray-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Monthly Tickets</CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.tickets_completed_this_month_data?.tickets_this_month}
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            {parseFloat(
              data?.tickets_completed_this_month_data
                ?.tickets_percentage_this_month
            ) >= 0 ? (
              <ArrowUp className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500" />
            )}
            {
              data?.tickets_completed_this_month_data
                ?.tickets_percentage_this_month
            }
            % vs last month
          </div>
          <div className="mt-4">
            <Progress
              value={
                data?.tickets_completed_this_month_data?.tickets_this_month
              }
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow hover:bg-gray-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Weekly Tickets</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {data?.tickets_completed_this_week_data?.tickets_this_week}
          </div>
          <div className="flex items-center text-xs text-muted-foreground mt-2">
            {parseFloat(
              data?.tickets_completed_this_week_data
                ?.tickets_percentage_this_week
            ) >= 0 ? (
              <ArrowUp className="h-3 w-3 text-green-500" />
            ) : (
              <ArrowDown className="h-3 w-3 text-red-500" />
            )}
            {
              data?.tickets_completed_this_week_data
                ?.tickets_percentage_this_week
            }
            % vs last week
          </div>
          <div className="mt-4">
            <Progress
              value={data?.tickets_completed_this_week_data?.tickets_this_week}
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow hover:bg-gray-50">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Ticket Status</CardTitle>
          <Ticket className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalTickets}</div>
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="flex flex-col items-center">
              <Clock className="h-4 w-4 text-yellow-500" />
              <span className="text-sm">Pending</span>
              <span className="font-medium">
                {data?.tickets?.tickets_pending}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <X className="h-4 w-4 text-red-500" />
              <span className="text-sm">Rejected</span>
              <span className="font-medium">
                {data?.tickets?.tickets_rejected}
              </span>
            </div>
            <div className="flex flex-col items-center">
              <Edit className="h-4 w-4 text-green-500" />
              <span className="text-sm">Edited</span>
              <span className="font-medium">
                {data?.tickets?.tickets_edited}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
