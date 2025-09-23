"use client";

import DataTableComponent from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { Building, PenIcon } from "lucide-react";
import { BRANCHES_COLUMNS } from "../_constants/branches-columns";
import { SEARCH_FILTER } from "@/constants/filter-by";
import SearchInput from "@/components/ui/search-input";
import { AddBranch } from "../_components/_branch-dialogs/add-branch";
import { useState } from "react";
import { BranchDetailDataType } from "../_types/branch-types";
import { EditBranch } from "../_components/_branch-dialogs/edit-branch";
import { DeleteBranch } from "../_components/_branch-dialogs/delete-branch";

function Branches() {
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
    url: "/admin/branches",
    isPaginated: true,
    filters: SEARCH_FILTER,
  });
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [selectedItem, setSelectedItem] = useState<BranchDetailDataType>(
    {} as BranchDetailDataType
  );

  const BRANCHES_COLUMNS_ACTIONS = [
    {
      name: "Action",
      cell: (row: any) => (
        <div className="flex gap-2">
          <button
            type="button"
            className="text-blue-500 hover:text-blue-600 hover:scale-105 transition-all duration-300 ease-in-out"
            onClick={handleEdit(row)}
          >
            <PenIcon size={18} />
          </button>
          <DeleteBranch data={row} setIsRefresh={setIsRefresh} />
        </div>
      ),
      sortable: false,
    },
  ];

  const handleEdit = (data: BranchDetailDataType) => () => {
    setSelectedItem(data);
    setIsDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between py-2 px-6">
          <CardTitle className="font-bold text-lg text-gray-600 flex items-center gap-1">
            <Building size={18} />
            <span>Branches</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <SearchInput onChange={handleSearchTerm(1000)} />
            <AddBranch setIsRefresh={setIsRefresh} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={[...BRANCHES_COLUMNS, ...BRANCHES_COLUMNS_ACTIONS]}
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
      <EditBranch
        setIsRefresh={setIsRefresh}
        data={selectedItem}
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
      />
    </div>
  );
}

export default withAuthPage(Branches, true);
