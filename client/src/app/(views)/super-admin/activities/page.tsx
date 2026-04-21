"use client";

import DataTableComponent from "@/components/data-table";
import { Badge } from "@/components/ui/badge";
import ButtonLoader from "@/components/ui/button-loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchInput from "@/components/ui/search-input";
import { ROLE } from "@/constants/roles";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import formattedDateAndTimeStrict from "@/utils/format-date-time-strict";
import { ActivityIcon } from "lucide-react";

function ActivityPage() {
  const {
    data,
    handlePageChange,
    handlePerPageChange,
    pagination,
    isLoading,
    filterBy,
    handleSearchTerm,
    setIsRefresh,
    isRefresh
  } = useFetch({ url: "/super-admin/activities", isPaginated: true });

  const ACTIVITIES_COLUMNS = [
    {
      name: "Full Name",
      cell: (row: any) => row?.full_name,
      sortable: false,
    },
    {
      name: "Email",
      cell: (row: any) => row?.email,
      sortable: false,
    },
    {
      name: "Role",
      cell: (row: any) => (
        <Badge variant={"default"} className="text-[10px]">
          {row?.role?.toUpperCase()}
        </Badge>
      ),
      sortable: false,
    },
    {
      name: "Description",
      cell: (row: any) => row?.description,
      sortable: false,
    },
    {
      name: "Created At",
      cell: (row: any) => formattedDateAndTimeStrict(row?.created_at),
      sortable: false,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between py-2 px-6">
          <CardTitle className="font-bold text-lg dark:text-white text-gray-600 flex items-center gap-1">
            <ActivityIcon size={18} />
            <span>Activities</span>
          </CardTitle>
          <div className="flex gap-1 items-center">
            <SearchInput
              onChange={handleSearchTerm(500)}
              placeholder="Search..."
            />
            <ButtonLoader
              type="button"
              onClick={() => setIsRefresh(true)}
              isLoading={isRefresh}
            >
              Refresh
            </ButtonLoader>
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={ACTIVITIES_COLUMNS}
            loading={isLoading || isRefresh}
            handlePageChange={handlePageChange}
            handlePerPageChange={handlePerPageChange}
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

export default withAuthPage(ActivityPage, [ROLE.SUPER_ADMIN]);
