import {
  Activity,
  Building,
  Pointer,
  Ticket,
  Truck,
  Users,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export default function AdminDashboardLoader() {
  return (
    <>
      <div className="flex justify-evenly gap-3">
        <Card className="w-full hover:shadow hover:bg-gray-50 border-l-5 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Branches
            </CardTitle>
            <Building className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>
        <Card className="w-full hover:shadow hover:bg-gray-50 border-l-5 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Total Suppliers
            </CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-9 w-24" />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <Card className="hover:shadow hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        <Card className="hover:shadow hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Monthly Tickets
            </CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        <Card className="hover:shadow hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">
              Weekly Tickets
            </CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        <Card className="hover:shadow hover:bg-gray-50">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Ticket Status</CardTitle>
            <Ticket className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="hover:shadow hover:bg-gray-50 col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>User Breakdown</span>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
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
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>

        <Card className="hover:shadow hover:bg-gray-50 col-span-1">
          <CardHeader>
            <CardTitle className="flex justify-between">
              <span>Quick Actions</span>
              <Pointer className="h-4 w-4 text-muted-foreground" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-20 w-full" />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
