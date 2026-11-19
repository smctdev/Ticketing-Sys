"use client";

import DataTableComponent from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { PackageSearch, PenBox, PenIcon, Trash, Users2 } from "lucide-react";
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
import AssignSuppliersDialog from "../_components/_accounting-dialogs/assign-suppliers";
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
  const [isDialogForSuppliersOpen, setIsDialogForSuppliersOpen] =
    useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  // Column para sa assigned suppliers (Accounting Staff lang)
  const ACCOUNTINGS_COLUMNS_SUPPLIERS = [
    {
      name: "Assigned Suppliers",
      cell: (row: any) => {
        if (row?.user_role?.role_name !== ROLE.ACCOUNTING_STAFF) {
          return <span className="text-xs text-muted-foreground">N/A</span>;
        }

        const suppliers: any[] = row?.assigned_suppliers ?? [];

        if (suppliers.length === 0) {
          return (
            <span className="rounded-full bg-gray-200 dark:bg-gray-700 px-2 py-0.5 text-xs font-bold text-gray-600 dark:text-gray-200">
              No specific supplier
            </span>
          );
        }

        const names = suppliers.map((s) => String(s.suppliers ?? "").trim());
        const shown = names.slice(0, 2);
        const rest = names.length - shown.length;

        return (
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex flex-wrap gap-1 py-1">
                {shown.map((name) => (
                  <span
                    key={name}
                    className="rounded-full bg-blue-600 px-2 py-0.5 text-xs font-bold text-white"
                  >
                    {name}
                  </span>
                ))}
                {rest > 0 && (
                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-bold text-blue-700">
                    +{rest}
                  </span>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <span>{names.join(", ")}</span>
            </TooltipContent>
          </Tooltip>
        );
      },
      sortable: false,
    },
  ];

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
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={handleEdit(row, "supplier")}
                  className="text-emerald-600 hover:text-emerald-700 hover:scale-105 transition-all duration-300 ease-in-out"
                >
                  <PackageSearch size={18} />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <span>Edit Assigned Suppliers</span>
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

  const handleEdit =
    (row: any, title: "category" | "branch" | "supplier") => () => {
      setUser(row);

      if (title === "category") {
        setIsDialogOpen(true);
      }

      if (title === "branch") {
        setIsDialogForBranchesOpen(true);
      }

      if (title === "supplier") {
        setIsDialogForSuppliersOpen(true);
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
            columns={[
              ...ACCOUNTINGS_COLUMNS,
              ...ACCOUNTINGS_COLUMNS_SUPPLIERS,
              ...ACCOUNTINGS_COLUMNS_ACTIONS,
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

      {isDialogForSuppliersOpen && (
        <AssignSuppliersDialog
          user={user}
          open={isDialogForSuppliersOpen}
          setOpen={setIsDialogForSuppliersOpen}
          fetchData={fetchData}
        />
      )}
    </div>
  );
}

export default withAuthPage(Accountings, ADMIN_ACCESS);