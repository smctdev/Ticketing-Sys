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
import { Check, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import SearchInput from "@/components/ui/search-input";
import { useAuth } from "@/context/auth-context";

export default function SelectFilter({
  isLoading,
  forFilterData,
  handleSelectFilter,
  filterBy,
  handleSearchTerm,
}: any) {
  const [open, setOpen] = useState(false);
  const { isAdmin } = useAuth();

  const handleOnSelect = (value: string) => () => {
    handleSelectFilter("branch_code")(value);
    setOpen(false);
  };

  return (
    <div
      className={`${
        isAdmin ? "grid grid-cols-2 lg:grid-cols-4" : "flex"
      } gap-2`}
    >
      <div className="flex flex-col gap-2 w-full">
        <Label htmlFor="branch_code">Branch Code</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {filterBy?.branch_code === "ALL"
                ? "ALL"
                : isLoading
                ? "Loading..."
                : forFilterData?.branches.find(
                    (item: any) => item.blist_id === filterBy?.branch_code
                  )?.b_name}
              <ChevronDown className="opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0" align="start">
            <Command>
              <CommandInput
                placeholder="Search branch code..."
                className="h-9"
              />
              <CommandList>
                <CommandEmpty>No branches found.</CommandEmpty>
                <CommandGroup>
                  <CommandItem onSelect={handleOnSelect("ALL")} value="ALL">
                    ALL
                  </CommandItem>
                  {isLoading ? (
                    <CommandItem disabled>Loading...</CommandItem>
                  ) : (
                    forFilterData?.branches.map((item: any, index: number) => (
                      <CommandItem
                        key={index}
                        onSelect={handleOnSelect(item.blist_id)}
                      >
                        {item.b_name} ({item.b_code})
                        <Check
                          className={cn(
                            "ml-auto",
                            filterBy?.branch_code === item.blist_id
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                      </CommandItem>
                    ))
                  )}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>
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
                  )
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
                  )
                )
              )}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
      {isAdmin && (
        <div className="flex flex-col gap-2 w-full">
          <Label htmlFor="search">Search</Label>
          <SearchInput
            value={filterBy.defaultSearchValue}
            onChange={handleSearchTerm()}
          />
        </div>
      )}
    </div>
  );
}
