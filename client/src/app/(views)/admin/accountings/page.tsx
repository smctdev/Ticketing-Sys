"use client";

import DataTableComponent from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { PenBox, PenIcon, Trash, Users2 } from "lucide-react";
import { SEARCH_FILTER } from "@/constants/filter-by";
import { ACCOUNTINGS_COLUMNS } from "../_constants/accountings-columns";
import SearchInput from "@/components/ui/search-input";
import EditAccountingCategoryDialog from "../_components/_accounting-dialogs/edit-accounting-category";
import { Activity, useState } from "react";
import Swal from "sweetalert2";
import { toast } from "sonner";
import { api } from "@/lib/api";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import EditAccountingDialog from "../_components/_accounting-dialogs/edit-accounting";
import { ADMIN_ACCESS, ROLE } from "@/constants/roles";

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
    fetchData,
  } = useFetch({
    url: "/accountings",
    isPaginated: true,
    filters: SEARCH_FILTER,
  });
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [isDialogForBranchesOpen, setIsDialogForBranchesOpen] =
    useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const ACCOUNTINGS_COLUMNS_ACTIONS = [
    {
      name: "Action",
      cell: (row: any) => (
        <div className="flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                onClick={handleEdit(row, "category")}
                className="text-blue-500 hover:text-blue-600 hover:scale-105 transition-all duration-300 ease-in-out"
              >
                <PenIcon size={18} />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <span>Edit Assigned Categories</span>
            </TooltipContent>
          </Tooltip>
          <Activity
            mode={
              row?.user_role?.role_name === ROLE.ACCOUNTING_STAFF
                ? "visible"
                : "hidden"
            }
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleEdit(row, "branch")}
                  className="text-blue-700 hover:text-blue-800 hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  <PenBox size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Edit Assigned Branches</span>
              </TooltipContent>
            </Tooltip>
          </Activity>
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

  const handleEdit = (row: any, title: "category" | "branch") => () => {
    if (title === "category") {
      setUser(row);
      setIsDialogOpen(true);
    }

    if (title === "branch") {
      setUser(row);
      setIsDialogForBranchesOpen(true);
    }
  };

  const handleDeleteAllCategories = (id: string | number) => () => {
    Swal.fire({
      icon: "info",
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: "Yes, remove all categories!",
      showDenyButton: true,
      denyButtonText: `Yes, remove all branches!`,
      denyButtonColor: "#4169E1",
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
        try {
          const response = await api.delete(
            `/accounting-category/${id}/delete`,
          );

          if (response.status === 200) {
            fetchData();
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
        }
      } else if (result.isDenied) {
        Swal.fire({
          title: "Removing all branches...",
          text: "Please wait while the branches are being removed...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        try {
          const response = await api.delete(`/accounting/${id}/delete`);

          if (response.status === 200) {
            fetchData();
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
        }
      }
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between py-2 px-6">
          <CardTitle className="font-bold text-lg dark:text-white text-gray-600 flex items-center gap-1">
            <Users2 size={18} />
            <span>Accountings</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <SearchInput onChange={handleSearchTerm(1000)} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data}
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
          fetchData={fetchData}
        />
      )}

      {isDialogForBranchesOpen && (
        <EditAccountingDialog
          user={user}
          open={isDialogForBranchesOpen}
          setOpen={setIsDialogForBranchesOpen}
          fetchData={fetchData}
        />
      )}
    </div>
  );
}

export default withAuthPage(Accountings, ADMIN_ACCESS);
