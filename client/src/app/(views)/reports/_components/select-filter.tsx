import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import SearchInput from "@/components/ui/search-input";
import { useAuth } from "@/context/auth-context";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectGroup,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import { ROLE } from "@/constants/roles";

export default function SelectFilter({
  isLoading,
  forFilterData,
  handleSelectFilter,
  filterBy,
  handleSearchTerm,
}: any) {
  const { user } = useAuth();
  const canView = ![ROLE.USER, ROLE.CAS].includes(user?.user_role?.role_name);

  const handleMultipleSelect = (values: string[]) => {
    handleSelectFilter("branch_code")(
      values?.length > 0 ? values.join(",") : "ALL",
    );
  };

  return (
    <>
      {canView && (
        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="search">Search</Label>
          <SearchInput
            value={filterBy.defaultSearchValue}
            onChange={handleSearchTerm()}
          />
        </div>
      )}
      <div
        className={`grid ${canView ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-3"} gap-2`}
      >
        {canView && (
          <div className="flex flex-col gap-2 w-full">
            <Label htmlFor="branch_code">Branch Code</Label>
            <MultiSelect modal={true} onValuesChange={handleMultipleSelect}>
              <MultiSelectTrigger className="w-full max-w-[385px] max-h-[200px] overflow-y-auto">
                <MultiSelectValue placeholder="Select branch codes..." />
              </MultiSelectTrigger>
              <MultiSelectContent>
                <MultiSelectGroup>
                  {forFilterData?.branches?.length === 0 ? (
                    <MultiSelectItem value="No branches yet." disabled>
                      No branches yet.
                    </MultiSelectItem>
                  ) : (
                    forFilterData?.branches?.map(
                      (branch: any, index: number) => (
                        <MultiSelectItem
                          key={index}
                          value={`${branch.blist_id}`}
                        >
                          {`(${branch.b_code}) ${branch.b_name}`}
                        </MultiSelectItem>
                      ),
                    )
                  )}
                </MultiSelectGroup>
              </MultiSelectContent>
            </MultiSelect>
          </div>
        )}
        <div className="flex flex-col gap-2 w-full">
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
                {isLoading ? (
                  <SelectItem value="Loading..." disabled>
                    Loading...
                  </SelectItem>
                ) : forFilterData?.ticket_categories?.length === 0 ? (
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
                    ),
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2 w-full">
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
                {isLoading ? (
                  <SelectItem value="Loading..." disabled>
                    Loading...
                  </SelectItem>
                ) : forFilterData?.branch_types?.length === 0 ? (
                  <SelectItem value="No branch type found">
                    No branch type found
                  </SelectItem>
                ) : (
                  forFilterData?.branch_types?.map(
                    (branch_type: any, index: number) => (
                      <SelectItem key={index} value={branch_type}>
                        {branch_type}
                      </SelectItem>
                    ),
                  )
                )}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-2">
          <Label htmlFor="ticket_type" className="px-1">
            Filter by ticket type
          </Label>
          <Select
            onValueChange={handleSelectFilter("ticket_type")}
            value={filterBy.ticket_type}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Filter by ticket type" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="Filter by ticket type" disabled>
                  Filter by ticket type
                </SelectItem>
                <SelectItem value="ALL">ALL</SelectItem>
                <SelectItem value="netsuite_ticket">Netsuite Ticket</SelectItem>
                <SelectItem value="sql_ticket">SQL Ticket</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>
    </>
  );
}
