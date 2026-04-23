"use client";

import NotFound from "@/app/not-found";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import SearchInput from "@/components/ui/search-input";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { ArrowLeft, Gauge } from "lucide-react";
import { useParams } from "next/navigation";
import { AddSubCategory } from "../../_components/_sub-category-dialogs/add-sub-category";
import useFetch from "@/hooks/use-fetch";
import { SEARCH_FILTER } from "@/constants/filter-by";
import DataTableComponent from "@/components/data-table";
import { EditSubCategory } from "../../_components/_sub-category-dialogs/edit-sub-category";
import { DeleteSubCategory } from "../../_components/_sub-category-dialogs/delete-sub-category";
import { SUB_CATEGORIES_COLUMNS } from "../../_constants/sub-categories-columns";
import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { TooltipArrow } from "@radix-ui/react-tooltip";
import { ADMIN_ACCESS } from "@/constants/roles";
import { useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";

type idParamstype = {
  id: string[];
};

function SubCategories() {
  const { id }: idParamstype = useParams();
  const validLength = id?.length === 2;
  const isNumber = !isNaN(Number(id[0]));
  const isSubCategories = id[1] === "sub-categories";
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
    url: `/admin/sub-categories/${id[0]}/ticket-category-items`,
    isPaginated: true,
    filters: SEARCH_FILTER,
  });
  const categoryRef = useRef<string>(document.title);

  useEffect(() => {
    if (!data?.category_name) return;

    document.title = `${categoryRef.current} | ${data?.category_name}`;
  }, [data?.category_name]);

  if (!validLength || !isNumber || !isSubCategories) {
    return <NotFound />;
  }

  const SUB_CATEGORY_COLUMNS_ACTIONS = [
    {
      name: "Action",
      cell: (row: any) => (
        <div className="flex gap-2">
          <EditSubCategory setIsRefresh={setIsRefresh} data={row} />
          <DeleteSubCategory setIsRefresh={setIsRefresh} data={row} />
        </div>
      ),
      sortable: false,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between py-2 px-6">
          <CardTitle className="font-bold text-lg dark:text-white text-gray-600 flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href={`/admin/categories`}
                  className="text-blue-500 hover:text-blue-600 hover:-translate-x-1 transition-all duration-300 ease-in-out"
                >
                  <ArrowLeft />
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <TooltipArrow />
                Back to categories
              </TooltipContent>
            </Tooltip>
            <Gauge size={18} />
           {isLoading ? <Skeleton className="h-8 w-60" /> : <span className="text-xs md:text-lg truncate">
              Sub Categories of{" "}
              {`"${data?.category_name ?? "Unknown Category"}"`}
            </span>}
          </CardTitle>
          <div className="flex items-center gap-2">
            <SearchInput onChange={handleSearchTerm(1000)} />
            <AddSubCategory
              ticketCategoryId={id[0]}
              setIsRefresh={setIsRefresh}
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={[
              ...SUB_CATEGORIES_COLUMNS,
              ...SUB_CATEGORY_COLUMNS_ACTIONS,
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
    </div>
  );
}

export default withAuthPage(SubCategories, ADMIN_ACCESS);
