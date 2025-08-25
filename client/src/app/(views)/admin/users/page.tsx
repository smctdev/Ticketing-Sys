"use client";

import DataTableComponent from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { PenIcon, Trash, Users2 } from "lucide-react";
import { SEARCH_FILTER } from "@/constants/filter-by";
import { Input } from "@/components/ui/input";
import { USERS_COLUMNS } from "../_constants/users-columns";
import { AddUser } from "../_components/add-users";

function Users() {
  const {
    data,
    isLoading,
    handleSearchTerm,
    handlePageChange,
    handlePerPageChange,
    filterBy,
    pagination,
    handleShort,
  } = useFetch({
    url: "/users",
    isPaginated: true,
    filters: SEARCH_FILTER,
  });

  const USERS_COLUMNS_ACTIONS = [
    {
      name: "Action",
      cell: (row: any) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="text-blue-500 hover:text-blue-600 hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <PenIcon size={18} />
          </button>
          <button
            type="button"
            className="text-red-500 hover:text-red-600 hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <Trash size={18} />
          </button>
        </div>
      ),
      sortable: false,
    },
  ];
  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between py-2 px-6">
          <CardTitle className="font-bold text-lg text-gray-600 flex items-center gap-1">
            <Users2 size={18} />
            <span>Users</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <Input
              type="search"
              onChange={handleSearchTerm(1000)}
              placeholder="Search..."
            />
            <AddUser />
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={[...USERS_COLUMNS, ...USERS_COLUMNS_ACTIONS]}
            loading={isLoading}
            handlePageChange={handlePageChange}
            handlePerPageChange={handlePerPageChange}
            handleShort={handleShort}
            column={pagination.sortBy}
            direction={pagination.sortDirection}
            pageTotal={pagination.totalRecords}
            searchTerm={filterBy.search}
            perPage={pagination.perPage}
            currentPage={pagination.page}
          />
        </CardContent>
      </Card>
    </div>
  );
}

export default withAuthPage(Users, true);
