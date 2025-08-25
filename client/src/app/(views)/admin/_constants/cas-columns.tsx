import { Badge } from "@/components/ui/badge";

export const CAS_COLUMNS = [
  {
    name: "Full Name",
    cell: (row: any) => row?.full_name,
    sortable: false,
  },
  {
    name: "Assigned Branches",
    cell: (row: any) => (
      <>
        <div className="flex gap-1 flex-wrap p-2">
          {row?.assigned_branch_cas?.length > 0 ? (
            row.assigned_branch_cas.map((branch: any, index: number) => (
              <Badge
                variant="outline"
                className="capitalize text-[10px] bg-blue-500 text-white"
                key={index}
              >
                {branch?.branch?.b_code}
              </Badge>
            ))
          ) : (
            <Badge variant={"destructive"}>
              <span className="text-red-100 font-bold text-xs">
                No assigned branches yet
              </span>
            </Badge>
          )}
        </div>
      </>
    ),
    sortable: false,
  },
];
