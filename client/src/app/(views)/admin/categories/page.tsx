"use client";

import DataTableComponent from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { FileStack, PenIcon, Plus } from "lucide-react";
import { TICKET_CATEGORIES_COLUMNS } from "../_constants/ticket-categories-columns";
import { SEARCH_FILTER } from "@/constants/filter-by";
import { Switch } from "@/components/ui/switch";
import { api } from "@/lib/api";
import { toast } from "sonner";
import SearchInput from "@/components/ui/search-input";
import { AddCategory } from "../_components/_category-dialogs/add-category";
import { EditCategory } from "../_components/_category-dialogs/edit-category";
import { useState } from "react";
import { DeleteCategory } from "../_components/_category-dialogs/delete-category";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { ADMIN_ACCESS } from "@/constants/roles";

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
    fetchData,
    isRefresh,
  } = useFetch({
    url: "/admin/ticket-categories",
    isPaginated: true,
    filters: SEARCH_FILTER,
  });
  const {
    data: groupCategories,
    isLoading: isLoadingGroupCategories,
    fetchData: fetchCategories,
  } = useFetch({
    url: "/group-categories",
  });
  const [selectedData, setSelectedData] = useState<null | any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const TICKET_CATEGORIES_COLUMNS_ACTIONS = [
    {
      name: "Show/Hide",
      cell: (row: any) => (
        <div>
          <Switch
            disabled={isRefresh}
            checked={row?.show_hide === "show"}
            onCheckedChange={handleShowHide(row?.ticket_category_id)}
            className="data-[state=checked]:bg-blue-500"
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
            onClick={handleEdit(row)}
            className="text-blue-500 hover:text-blue-600 hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <PenIcon size={18} />
          </button>
          <DeleteCategory
            data={row}
            fetchData={fetchData}
            fetchCategories={fetchCategories}
          />
          <Link
            href={`/admin/categories/${row?.ticket_category_id}/sub-categories`}
          >
            <Tooltip>
              <TooltipTrigger>
                <Plus className="text-blue-500 hover:text-blue-500" />
              </TooltipTrigger>
              <TooltipContent>
                <TooltipArrow />
                Add Sub Categories
              </TooltipContent>
            </Tooltip>
          </Link>
        </div>
      ),
      sortable: false,
    },
  ];

  const handleShowHide = (id: number) => async (e: any) => {
    try {
      const response = await api.patch(`/ticket-category/${id}/show-hide`, {
        show_hide: e,
      });
      if (response.status === 200) {
        toast.success("Success", {
          description: response.data.message,
          position: "bottom-center",
        });
        fetchData();
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (row: any) => () => {
    setSelectedData(row);
    setIsDialogOpen(true);
  };
  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between py-2 px-6">
          <CardTitle className="font-bold text-lg dark:text-white text-gray-600 flex items-center gap-1">
            <FileStack size={18} />
            <span>Categories</span>
          </CardTitle>
          <div className="flex gap-2 items-center">
            <SearchInput onChange={handleSearchTerm(1000)} />
            <AddCategory
              groupCategories={groupCategories}
              isLoadingGroupCategories={isLoadingGroupCategories}
              fetchData={fetchData}
              fetchCategories={fetchCategories}
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data}
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
            currentPage={pagination.page}
          />
        </CardContent>
      </Card>
      <EditCategory
        data={selectedData}
        groupCategories={groupCategories}
        isLoadingGroupCategories={isLoadingGroupCategories}
        open={isDialogOpen}
        setOpen={setIsDialogOpen}
        fetchData={fetchData}
        fetchCategories={fetchCategories}
      />
    </div>
  );
}

export default withAuthPage(Categories, ADMIN_ACCESS);
