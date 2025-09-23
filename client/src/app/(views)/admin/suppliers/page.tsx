"use client";

import DataTableComponent from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { Truck } from "lucide-react";
import { SEARCH_FILTER } from "@/constants/filter-by";
import { SUPPLIERS_COLUMNS } from "../_constants/suppliers-columns";
import SearchInput from "@/components/ui/search-input";
import { AddSupplier } from "../_components/_supplier-dialogs/add-supplier";
import { EditSupplier } from "../_components/_supplier-dialogs/edit-supplier";
import { DeleteSupplier } from "../_components/_supplier-dialogs/delete-supplier";

function Suppliers() {
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
    url: "/suppliers",
    isPaginated: true,
    filters: SEARCH_FILTER,
  });

  const SUPPLIERS_COLUMNS_ACTIONS = [
    {
      name: "Action",
      cell: (row: any) => (
        <div className="flex gap-2">
          <EditSupplier setIsRefresh={setIsRefresh} data={row} />
          <DeleteSupplier setIsRefresh={setIsRefresh} data={row} />
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
            <Truck size={18} />
            <span>Suppliers</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <SearchInput onChange={handleSearchTerm(1000)} />
            <AddSupplier setIsRefresh={setIsRefresh} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={[...SUPPLIERS_COLUMNS, ...SUPPLIERS_COLUMNS_ACTIONS]}
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

export default withAuthPage(Suppliers, true);
