"use client";

import DataTableComponent from "@/components/data-table";
import useFetch from "@/hooks/use-fetch";
import appPage from "@/lib/hoc/app-page";
import { TICKETS_COLUMNS } from "../dashboard/_constants/tickets-columns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Funnel, Ticket } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

function Tickets() {
  const {
    data,
    isLoading,
    handleSearchTerm,
    handlePageChange,
    handlePerPageChange,
    handleShort,
    filterBy,
    pagination,
    handleFilter,
    handleReset,
  } = useFetch({
    url: "/tickets",
    isPaginated: true,
  });

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader>
          <CardTitle className="font-bold text-lg text-gray-600 flex items-center gap-1">
            <Funnel size={18} />
            <span>Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex gap-2 justify-evenly">
            <Select onValueChange={handleFilter} value={filterBy.status}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Filter by status" disabled>
                    Filter by status
                  </SelectItem>
                  <SelectItem value="ALL">ALL</SelectItem>
                  <SelectItem value="EDITED">EDITED</SelectItem>
                  <SelectItem value="REJECTED">REJECTED</SelectItem>
                  <SelectItem value="PENDING">PENDING</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Input
              onChange={handleSearchTerm(1000)}
              value={filterBy.defaultSearchValue}
              type="search"
              placeholder="Search..."
            />
            <Button
              type="button"
              onClick={handleReset}
              variant="ghost"
              className="bg-yellow-400 text-white hover:bg-yellow-500 hover:text-white"
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>
      <Card className="gap-0">
        <CardHeader>
          <CardTitle className="font-bold text-lg text-gray-600 flex items-center gap-1">
            <Ticket size={18} />
            <span>Tickets</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={TICKETS_COLUMNS}
            loading={isLoading}
            handlePageChange={handlePageChange}
            handlePerPageChange={handlePerPageChange}
            handleShort={handleShort}
            column={pagination.sortBy}
            direction={pagination.sortDirection}
            pageTotal={pagination.totalRecords}
            searchTerm={filterBy.search}
            perPage={pagination.perPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default appPage(Tickets);
