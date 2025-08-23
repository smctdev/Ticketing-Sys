"use client";

import DataTableComponent from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { File, PenIcon, Trash } from "lucide-react";
import { TICKET_CATEGORIES_COLUMNS } from "./_constants/ticket-categories-columns";
import { BRANCHES_FILTER } from "@/constants/filter-by";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { toast } from "sonner";

function Categories() {
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
    isRefresh,
  } = useFetch({
    url: "/admin-ticket-categories",
    isPaginated: true,
    filters: BRANCHES_FILTER,
  });

  const TICKET_CATEGORIES_COLUMNS_ACTIONS = [
    {
      name: "Show/Hide",
      cell: (row: any) => (
        <div>
          <Switch
            disabled={isRefresh}
            checked={row?.show_hide === "show"}
            onCheckedChange={handleShowHide(row?.ticket_category_id)}
          />
        </div>
      ),
      sortable: false,
    },
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

  const handleShowHide = (id: number) => async (e: any) => {
    setIsRefresh(true);
    try {
      const response = await api.patch(`/ticket-category/${id}/show-hide`, {
        show_hide: e,
      });
      if (response.status === 200) {
        toast("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsRefresh(false);
    }
  };
  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between py-2 px-6">
          <CardTitle className="font-bold text-lg text-gray-600 flex items-center gap-1">
            <File size={18} />
            <span>Branches</span>
          </CardTitle>
          <div>
            <Input
              type="search"
              onChange={handleSearchTerm(1000)}
              placeholder="Search..."
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={[
              ...TICKET_CATEGORIES_COLUMNS,
              ...TICKET_CATEGORIES_COLUMNS_ACTIONS,
            ]}
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

export default withAuthPage(Categories, true);
