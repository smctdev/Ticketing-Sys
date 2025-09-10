import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Activity,
  Users,
  Ticket,
  Building,
  Truck,
  Pointer,
} from "lucide-react";
import Link from "next/link";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function BottomCard({ data, totalTickets }: any) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card className="hover:shadow hover:bg-gray-50 col-span-1">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>User Breakdown</span>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pr-2">
          <ScrollArea className="h-45 pr-4">
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Staffs</span>
                  <span className="text-sm">
                    {data?.total_users?.total_staff}
                  </span>
                </div>
                <Progress
                  value={
                    (data?.total_users?.total_staff /
                      data?.total_users?.total_users) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Branch Heads</span>
                  <span className="text-sm">
                    {data?.total_users?.total_branch_head}
                  </span>
                </div>
                <Progress
                  value={
                    (data?.total_users?.total_branch_head /
                      data?.total_users?.total_users) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Accounting Heads</span>
                  <span className="text-sm">
                    {data?.total_users?.total_accounting_head}
                  </span>
                </div>
                <Progress
                  value={
                    (data?.total_users?.total_accounting_head /
                      data?.total_users?.total_users) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Automations</span>
                  <span className="text-sm">
                    {data?.total_users?.total_automation}
                  </span>
                </div>
                <Progress
                  value={
                    (data?.total_users?.total_automation /
                      data?.total_users?.total_users) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Area Managers</span>
                  <span className="text-sm">
                    {data?.total_users?.total_area_manager}
                  </span>
                </div>
                <Progress
                  value={
                    (data?.total_users?.total_area_manager /
                      data?.total_users?.total_users) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">Accounting Staffs</span>
                  <span className="text-sm">
                    {data?.total_users?.total_accounting_staff}
                  </span>
                </div>
                <Progress
                  value={
                    (data?.total_users?.total_accounting_staff /
                      data?.total_users?.total_users) *
                    100
                  }
                  className="h-2"
                />
              </div>
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">CAS</span>
                  <span className="text-sm">
                    {data?.total_users?.total_cas}
                  </span>
                </div>
                <Progress
                  value={
                    (data?.total_users?.total_cas /
                      data?.total_users?.total_users) *
                    100
                  }
                  className="h-2"
                />
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      <Card className="hover:shadow hover:bg-gray-50 col-span-1">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Ticket Statistics</span>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Pending Tickets</span>
                <span className="text-sm">
                  {data?.tickets?.tickets_pending}
                </span>
              </div>
              <Progress
                value={(data?.tickets?.tickets_pending / totalTickets) * 100}
                className="h-2 bg-yellow-200"
                valueColor="bg-yellow-400"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Rejected Tickets</span>
                <span className="text-sm">
                  {data?.tickets?.tickets_rejected}
                </span>
              </div>
              <Progress
                value={(data?.tickets?.tickets_rejected / totalTickets) * 100}
                className="h-2 bg-red-200"
                valueColor="bg-red-400"
              />
            </div>
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium">Edited Tickets</span>
                <span className="text-sm">{data?.tickets?.tickets_edited}</span>
              </div>
              <Progress
                value={(data?.tickets?.tickets_edited / totalTickets) * 100}
                className="h-2 bg-green-200"
                valueColor="bg-green-400"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow hover:bg-gray-50 col-span-1">
        <CardHeader>
          <CardTitle className="flex justify-between">
            <span>Quick Actions</span>
            <Pointer className="h-4 w-4 text-muted-foreground" />
          </CardTitle>
        </CardHeader>
        <CardContent className="pr-2">
          <ScrollArea className="h-45 pr-4">
            <div className="grid gap-2">
              <Link className="w-full" href="/admin/users">
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start w-full"
                >
                  <Users className="mr-2 h-4 w-4" />
                  Manage Users
                </Button>
              </Link>
              <Link className="w-full" href="/admin/branches">
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start w-full"
                >
                  <Building className="mr-2 h-4 w-4" />
                  Manage Branches
                </Button>
              </Link>
              <Link className="w-full" href="/admin/suppliers">
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start w-full"
                >
                  <Truck className="mr-2 h-4 w-4" />
                  Manage Suppliers
                </Button>
              </Link>
              <Link className="w-full" href="/tickets">
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start w-full"
                >
                  <Ticket className="mr-2 h-4 w-4" />
                  View All Tickets
                </Button>
              </Link>
              <Link className="w-full" href="/reports">
                <Button
                  type="button"
                  variant="outline"
                  className="justify-start w-full"
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Generate Reports
                </Button>
              </Link>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}
