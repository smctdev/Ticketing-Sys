"use client";

import DataTableComponent from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { Users2 } from "lucide-react";
import { SEARCH_FILTER } from "@/constants/filter-by";
import { USERS_COLUMNS } from "../_constants/users-columns";
import { AddUser } from "../_components/_user-dialogs/add-user";
import { EditUser } from "../_components/_user-dialogs/edit-user";
import { useMemo } from "react";
import { SelectItem } from "@/components/ui/select";
import { DeleteUser } from "../_components/_user-dialogs/delete-user";
import SearchInput from "@/components/ui/search-input";
interface UserRoleTypes {
  user_role_id: string;
  role_name: string;
}

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
    setIsRefresh,
  } = useFetch({
    url: "/users",
    isPaginated: true,
    filters: SEARCH_FILTER,
  });
  const { isLoading: branchIsLoading, data: branchData } = useFetch({
    url: "/branches",
  });

  const { isLoading: userRoleIsLoading, data: userRoleData } = useFetch({
    url: "/admin/all-user-roles",
  });

  const USERS_COLUMNS_ACTIONS = [
    {
      name: "Action",
      cell: (row: any) => (
        <div className="flex gap-2">
          <EditUser
            setIsRefresh={setIsRefresh}
            data={row}
            branchMemo={branchMemo}
            userRoleMemo={userRoleMemo}
          />

          <DeleteUser data={row} setIsRefresh={setIsRefresh} />
        </div>
      ),
      sortable: false,
    },
  ];

  const branchMemo = useMemo(() => {
    return branchIsLoading
      ? "isLoading"
      : branchData?.data?.length === 0
      ? "isEmpty"
      : branchData?.data;
  }, [branchData?.data]);

  const userRoleMemo = useMemo(() => {
    return userRoleIsLoading ? (
      <SelectItem disabled value="Loading...">
        Loading...
      </SelectItem>
    ) : userRoleData?.data?.length === 0 ? (
      <SelectItem disabled value="No roles yet.">
        No roles yet.
      </SelectItem>
    ) : (
      userRoleData?.data?.map((item: UserRoleTypes, index: number) => (
        <SelectItem key={index} value={String(item.user_role_id)}>
          {item.role_name}
        </SelectItem>
      ))
    );
  }, [userRoleData?.data]);

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between py-2 px-6">
          <CardTitle className="font-bold text-lg text-gray-600 flex items-center gap-1">
            <Users2 size={18} />
            <span>Users</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <SearchInput onChange={handleSearchTerm(1000)} />
            <AddUser
              setIsRefresh={setIsRefresh}
              userRoleMemo={userRoleMemo}
              branchMemo={branchMemo}
            />
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
