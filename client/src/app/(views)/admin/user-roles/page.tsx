"use client";

import DataTableComponent from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { UserLock } from "lucide-react";
import { SEARCH_FILTER } from "@/constants/filter-by";
import { AddUserRole } from "../_components/_user-roles-dialogs/add-user-role";
import { USER_ROLES_COLUMNS } from "../_constants/user-roles-columns";
import { EditUserRole } from "../_components/_user-roles-dialogs/edit-user-role";
import { UserRoleDataType } from "../_types/user-roles-types";
import { DeleteUserRole } from "../_components/_user-roles-dialogs/delete-user-role";
import SearchInput from "@/components/ui/search-input";

function UserRoles() {
  const {
    data,
    isLoading,
    handleSearchTerm,
    handlePageChange,
    handlePerPageChange,
    filterBy,
    pagination,
    handleShort,
    setIsRefresh,
  } = useFetch({
    url: "/admin/user-roles",
    isPaginated: true,
    filters: SEARCH_FILTER,
  });

  const USER_ROLES_COLUMNS_ACTIONS = [
    {
      name: "Action",
      cell: (row: UserRoleDataType) => (
        <div className="flex gap-2">
          <EditUserRole data={row} setIsRefresh={setIsRefresh} />
          <DeleteUserRole data={row} setIsRefresh={setIsRefresh} />
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
            <UserLock size={18} />
            <span>User Roles</span>
          </CardTitle>
          <div className="flex gap-2 items-center">
            <SearchInput onChange={handleSearchTerm(1000)} />
            <AddUserRole setIsRefresh={setIsRefresh} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={[...USER_ROLES_COLUMNS, ...USER_ROLES_COLUMNS_ACTIONS]}
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

export default withAuthPage(UserRoles, true);
