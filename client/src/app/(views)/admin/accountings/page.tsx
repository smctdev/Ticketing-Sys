"use client";

import DataTableComponent from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { PenIcon, Trash, Users2 } from "lucide-react";
import { SEARCH_FILTER } from "@/constants/filter-by";
import { ACCOUNTINGS_COLUMNS } from "../_constants/accountings-columns";
import SearchInput from "@/components/ui/search-input";
import EditAccountingCategoryDialog from "../_components/_accounting-dialogs/edit-accounting-category";
import { useState } from "react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { api } from "@/lib/api";

function Accountings() {
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
    url: "/accountings",
    isPaginated: true,
    filters: SEARCH_FILTER,
  });
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const ACCOUNTINGS_COLUMNS_ACTIONS = [
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
          <button
            type="button"
            onClick={handleDeleteAllCategories(row.login_id)}
            className="text-red-500 hover:text-red-600 hover:scale-105 transition-all duration-300 ease-in-out"
          >
            <Trash size={18} />
          </button>
        </div>
      ),
      sortable: false,
    },
  ];

  const handleEdit = (row: any) => () => {
    setUser(row);
    setIsDialogOpen(true);
  };

  const handleDeleteAllCategories = (id: string | number) => () => {
    Swal.fire({
      icon: "info",
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: "Yes, remove all categories!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Removing all categories...",
          text: "Please wait while the categories are being removed...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        setIsRefresh(true);
        try {
          const response = await api.delete(
            `/accounting-category/${id}/delete`
          );

          if (response.status === 200) {
            Swal.close();
            toast.success("Success", {
              description: response.data.message,
              position: "bottom-center",
            });
          }
        } catch (error: any) {
          console.error(error);
          Swal.fire({
            icon: "error",
            title: "Oops...",
            text: error.response.data.message,
            confirmButtonText: "Close",
          });
        } finally {
          setIsRefresh(false);
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between py-2 px-6">
          <CardTitle className="font-bold text-lg text-gray-600 flex items-center gap-1">
            <Users2 size={18} />
            <span>Accountings</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <SearchInput onChange={handleSearchTerm(1000)} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={[...ACCOUNTINGS_COLUMNS, ...ACCOUNTINGS_COLUMNS_ACTIONS]}
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

      {isDialogOpen && (
        <EditAccountingCategoryDialog
          user={user}
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          setIsRefresh={setIsRefresh}
        />
      )}
    </div>
  );
}

export default withAuthPage(Accountings, true);
