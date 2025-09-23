"use client";

import DataTableComponent from "@/components/data-table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import useFetch from "@/hooks/use-fetch";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { PenIcon, Trash, Users2 } from "lucide-react";
import { SEARCH_FILTER } from "@/constants/filter-by";
import { AUTOMATIONS_COLUMNS } from "../_constants/automations-columns";
import SearchInput from "@/components/ui/search-input";
import Swal from "sweetalert2";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useState } from "react";
import EditAutomationDialog from "../_components/_automation-dialogs/edit-automation";

function Automations() {
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
    url: "/automations",
    isPaginated: true,
    filters: SEARCH_FILTER,
  });
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [user, setUser] = useState<any>(null);

  const AUTOMATIONS_COLUMNS_ACTIONS = [
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
            onClick={handleDeleteAllBranches(row.login_id)}
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

  const handleDeleteAllBranches = (id: string | number) => () => {
    Swal.fire({
      icon: "info",
      title: "Are you sure?",
      text: "You won't be able to revert this!",
      showCancelButton: true,
      confirmButtonText: "Yes, remove all branches!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: "Removing all branches...",
          text: "Please wait while the branches are being removed...",
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
        });
        setIsRefresh(true);
        try {
          const response = await api.delete(`/automation/${id}/delete`);

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
            <span>Automations</span>
          </CardTitle>
          <div className="flex items-center gap-2">
            <SearchInput onChange={handleSearchTerm(1000)} />
          </div>
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={[...AUTOMATIONS_COLUMNS, ...AUTOMATIONS_COLUMNS_ACTIONS]}
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
        <EditAutomationDialog
          user={user}
          open={isDialogOpen}
          setOpen={setIsDialogOpen}
          setIsRefresh={setIsRefresh}
        />
      )}
    </div>
  );
}

export default withAuthPage(Automations, true);
