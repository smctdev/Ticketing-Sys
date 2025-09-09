import DataTableComponent from "@/components/data-table";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Eye } from "lucide-react";
import { VIEW_DETAIL_COMLUMNS } from "../_constants/view-detail-columns";

export function ViewReportDetails({ data }: any) {
  const VIEW_DETAIL_COMLUMNS_ACTION = [
    {
      name: "ACTION",
      cell: (row: any) => (
        <div className="flex gap-2">
          <Button type="button" className="bg-blue-500 hover:bg-blue-600">
            Return to automation
          </Button>
          <Button type="button" className="bg-red-500 hover:bg-red-600">
            Mark as not counted
          </Button>
          <Button type="button" className="bg-indigo-500 hover:bg-indigo-600">
            Edit note
          </Button>
        </div>
      ),
      width: "500px"
    },
  ];
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <button
          type="button"
          className="border-none bg-transparent shadow-none hover:scale-105 w-fit"
        >
          <Eye className="h-4 w-4 text-green-500 hover:text-green-600" />
        </button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            <span className="text-gray-700 text-sm">
              Viewing{" "}
              <span className="font-bold">
                {data.branch_name} - {data.branch_code}
              </span>{" "}
              ({data.ticket_count}) ticket(s)...
            </span>
          </DrawerTitle>
        </DrawerHeader>
        <DataTableComponent
          data={data.tickets}
          columns={[...VIEW_DETAIL_COMLUMNS, ...VIEW_DETAIL_COMLUMNS_ACTION]}
          isPaginated={false}
          isFixedHeader={true}
        />
        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Close</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
