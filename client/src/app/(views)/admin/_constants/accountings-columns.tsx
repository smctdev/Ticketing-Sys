import { Badge } from "@/components/ui/badge";

export const ACCOUNTINGS_COLUMNS = [
  {
    name: "Full Name",
    cell: (row: any) => row?.full_name,
    sortable: false,
  },
  {
    name: "Assigned Categories",
    cell: (row: any) => (
      <>
        <div className="flex gap-1 flex-wrap p-2">
          {row?.assigned_categories?.length > 0 ? (
            row.assigned_categories.map((category: any, index: number) => (
              <Badge
                variant="outline"
                className="capitalize text-[10px] bg-blue-500 text-white"
                key={index}
              >
                {category?.category_group_code?.group_code}
              </Badge>
            ))
          ) : (
            <Badge variant={"destructive"}>
              <span className="text-red-100 font-bold text-xs">
                No assigned categories yet
              </span>
            </Badge>
          )}
        </div>
      </>
    ),
    sortable: false,
  },
];
