import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function SelectFilter({
  forFilterData,
  handleSelectFilter,
  filterBy,
}: any) {
  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="flex flex-col gap-2">
        <Label htmlFor="branch_code">Branch Code</Label>
        <Select
          onValueChange={handleSelectFilter("branch_code")}
          value={filterBy.branch_code}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by branch code" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Filter by branch_code" disabled>
                Filter by branch code
              </SelectItem>
              <SelectItem value="ALL">ALL</SelectItem>
              {forFilterData?.branches?.length === 0 ? (
                <SelectItem value="No branches found">
                  No branches found
                </SelectItem>
              ) : (
                forFilterData?.branches?.map((branch: any, index: number) => (
                  <SelectItem key={index} value={branch.blist_id}>
                    {branch.b_name} - ({branch.b_code})
                  </SelectItem>
                ))
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="ticket_category">Ticket Category</Label>
        <Select
          onValueChange={handleSelectFilter("ticket_category")}
          value={filterBy.ticket_category}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by ticket category" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Filter by ticket category" disabled>
                Filter by ticket category
              </SelectItem>
              <SelectItem value="ALL">ALL</SelectItem>
              {forFilterData?.ticket_categories?.length === 0 ? (
                <SelectItem value="No ticket categories found">
                  No ticket categories found
                </SelectItem>
              ) : (
                forFilterData?.ticket_categories?.map(
                  (ticket_category: any, index: number) => (
                    <SelectItem
                      key={index}
                      value={ticket_category.ticket_category_id}
                    >
                      {ticket_category.category_name}
                    </SelectItem>
                  )
                )
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="branch_type">Branch Type</Label>
        <Select
          onValueChange={handleSelectFilter("branch_type")}
          value={filterBy.branch_type}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Filter by branch type" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="Filter by branch type" disabled>
                Filter by branch type
              </SelectItem>
              <SelectItem value="ALL">ALL</SelectItem>
              {forFilterData?.branch_types?.length === 0 ? (
                <SelectItem value="No branch type found">
                  No branch type found
                </SelectItem>
              ) : (
                forFilterData?.branch_types?.map(
                  (branch_type: any, index: number) => (
                    <SelectItem key={index} value={branch_type}>
                      {branch_type}
                    </SelectItem>
                  )
                )
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
