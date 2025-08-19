import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Truck } from "lucide-react";

export default function BranchSupplierCard({ data }: any) {
  return (
    <div className="flex justify-evenly gap-3">
      <Card className="w-full hover:shadow hover:bg-gray-50 border-l-5 border-l-green-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Branches</CardTitle>
          <Building className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <span className="text-gray-600 text-xl font-bold">
            {data.branches}
          </span>
        </CardContent>
      </Card>
      <Card className="w-full hover:shadow hover:bg-gray-50 border-l-5 border-l-blue-500">
        <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
          <CardTitle className="text-sm font-medium">Total Suppliers</CardTitle>
          <Truck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <span className="text-gray-600 text-xl font-bold">
            {data.suppliers}
          </span>
        </CardContent>
      </Card>
    </div>
  );
}
