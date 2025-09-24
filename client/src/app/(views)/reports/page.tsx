"use client";

import DataTableComponent from "@/components/data-table";
import useFetch from "@/hooks/use-fetch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, File, FileOutput, Funnel, Loader2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import withAuthPage from "@/lib/hoc/with-auth-page";
import { REPORTS_FILTER, SEARCH_FILTER } from "@/constants/filter-by";
import { REPORTS_COLUMNS } from "../dashboard/_constants/reports-columns";
import { ViewReportDetails } from "./_components/view-report-details";
import DateFilter from "./_components/date-filter";
import SelectFilter from "./_components/select-filter";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useState } from "react";
import { api } from "@/lib/api";
import formattedDate from "@/utils/format-date";
import { formatDate } from "date-fns";
import { useAuth } from "@/context/auth-context";
import { toast } from "sonner";
import { useIsRefresh } from "@/context/is-refresh-context";

function Reports() {
  const [isLoadingToExport, setIsLoadingToExport] = useState<boolean>(false);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const { user } = useAuth();
  const { isRefresh } = useIsRefresh();
  const {
    data,
    isLoading,
    handlePageChange,
    handlePerPageChange,
    handleShort,
    filterBy,
    pagination,
    handleSelectFilter,
    handleDateFilter,
    handleReset,
    handleSearchTerm,
  } = useFetch({
    url: "/reports",
    isPaginated: true,
    filters: { ...REPORTS_FILTER, ...SEARCH_FILTER },
    canBeRefreshGlobal: isRefresh,
  });
  const [isOpenDrawer, setIsOpenDrawer] = useState<boolean>(false);
  const [selectedData, setSelectedData] = useState<null | any>(null);
  const { data: forFilterData, isLoading: isLoadingForFilter } = useFetch({
    url: "/for-filter-datas",
  });

  const REPORTS_COLUMNS_ACTIONS = [
    {
      name: "Action",
      cell: (row: any) => (
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleOpenDrawer(row)}
            className="border-none bg-transparent shadow-none hover:scale-105 w-fit"
          >
            <Eye className="h-4 w-4 text-green-500 hover:text-green-600" />
          </button>
        </div>
      ),
    },
  ];

  const conditionalRowStyles = [
    {
      when: (row: any) => row.counted === 1,
      style: {
        backgroundColor: "#fee2e2",
        color: "#991b1b",
        "&:hover": {
          backgroundColor: "#fecaca",
        },
      },
    },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);

    setTimeout(() => {
      setIsGenerating(false);
      toast.success("Success", {
        position: "bottom-center",
        description: "Report has been generated successfully!",
      });
      handleExport();
    }, 3000);
  };

  const handleExport = async () => {
    setIsLoadingToExport(true);
    try {
      const response = await api.post("/export-reports", filterBy);
      const tickets = response?.data?.data?.tickets;
      const totals = response?.data?.data?.totals;

      if (!tickets || tickets?.length === 0) {
        alert("No data to export!");
        return;
      }

      const exportData: any[] = [];

      tickets.forEach((t: any) => {
        const purposes = Array.isArray(t.ticket_detail?.td_purpose)
          ? t.ticket_detail?.td_purpose
          : [t.ticket_detail?.td_purpose ?? ""];

        const froms = Array.isArray(t.ticket_detail?.td_from)
          ? t.ticket_detail?.td_from
          : [t.ticket_detail?.td_from ?? ""];

        const tos = Array.isArray(t.ticket_detail?.td_to)
          ? t.ticket_detail?.td_to
          : [t.ticket_detail?.td_to ?? ""];

        const maxLength = Math.max(purposes.length, froms.length, tos.length);

        for (let i = 0; i < maxLength; i++) {
          exportData.push({
            "Ticket Code": i === 0 ? t?.ticket_code : "",
            "Transaction Date":
              i === 0
                ? formattedDate(t?.ticket_detail?.ticket_transaction_date)
                : "",
            Category:
              i === 0 ? t?.ticket_detail?.ticket_category?.category_name : "",
            "Reference Number": i === 0 ? t?.ticket_detail?.td_ref_number : "",
            Purpose: purposes[i] ?? "",
            From: froms[i] ?? "",
            To: tos[i] ?? "",
            Note: i === 0 ? t?.ticket_detail?.td_note : "",
            Branch: i === 0 ? t?.branch_name : "",
            "Requested By": i === 0 ? t?.user_login?.full_name : "",
            "Approve By BM/BS": i === 0 ? t?.approve_head?.full_name : "",
            "Approve By Acctg. Staff":
              i === 0 ? t?.approve_acctg_staff?.full_name : "",
            "Approve By Accounting Head":
              i === 0 ? t?.approve_acctg_sup?.full_name : "",
            "Edited By": i === 0 ? t?.assigned_person?.full_name : "",
            "Date Edited":
              i === 0 ? formattedDate(t?.ticket_detail?.date_completed) : "",
            Counted: i === 0 ? (t?.isCounted === 0 ? "YES" : "NO") : "",
          });
        }
      });

      exportData.push({
        "Ticket Code": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Transaction Date": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        Category: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Reference Number": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        Purpose: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        From: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        To: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        Note: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        Branch: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Requested By": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Approve By BM/BS": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Approve By Acctg. Staff": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Approve By Accounting Head": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Edited By": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Date Edited": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        Counted: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
      });

      exportData.push({
        "Ticket Code": "",
        "Transaction Date": "TOTAL:",
        Category: "",
        "Reference Number": "",
        Purpose: "",
        From: "",
        To: "",
        Note: "",
        Branch: "",
        "Requested By": "",
        "Approve By BM/BS": "",
        "Approve By Acctg. Staff": "",
        "Approve By Accounting Head": "",
        "Edited By": "",
        "Date Edited": "",
        Counted: "",
      });

      totals.forEach((total: any) => {
        exportData.push({
          "Ticket Code": "",
          "Transaction Date": "",
          Category: total?.branch_name,
          "Reference Number": total?.ticket_count,
          Purpose: "",
          From: "",
          To: "",
          Note: "",
          Branch: "",
          "Requested By": "",
          "Approve By BM/BS": "",
          "Approve By Acctg. Staff": "",
          "Approve By Accounting Head": "",
          "Edited By": "",
          "Date Edited": "",
          Counted: "",
        });
      });

      exportData.push({
        "Ticket Code": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Transaction Date": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        Category: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Reference Number": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        Purpose: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        From: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        To: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        Note: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        Branch: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Requested By": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Approve By BM/BS": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Approve By Acctg. Staff": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Approve By Accounting Head": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Edited By": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        "Date Edited": "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
        Counted: "=+=+=+=+=+=+=+=+=+=+=+=+=+=+=+",
      });

      exportData.push({
        "Ticket Code": "",
        "Transaction Date": "EXPORTED BY:",
        Category: user?.full_name,
        "Reference Number": "",
        Purpose: "",
        From: "",
        To: "",
        Note: "",
        Branch: "",
        "Requested By": "",
        "Approve By BM/BS": "",
        "Approve By Acctg. Staff": "",
        "Approve By Accounting Head": "",
        "Edited By": "",
        "Date Edited": "",
        Counted: "",
      });

      exportData.push({
        "Ticket Code": "",
        "Transaction Date": "DATE EXPORTED:",
        Category: formatDate(new Date(), `MMMM dd, yyyy 'at' hh:mm a`),
        "Reference Number": "",
        Purpose: "",
        From: "",
        To: "",
        Note: "",
        Branch: "",
        "Requested By": "",
        "Approve By BM/BS": "",
        "Approve By Acctg. Staff": "",
        "Approve By Accounting Head": "",
        "Edited By": "",
        "Date Edited": "",
        Counted: "",
      });

      const worksheet = XLSX.utils.json_to_sheet(exportData);

      const colWidths = [{ wch: 20 }, { wch: 15 }, { wch: 12 }, { wch: 18 }];
      worksheet["!cols"] = colWidths;

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Reports");

      const excelBuffer = XLSX.write(workbook, {
        bookType: "xlsx",
        type: "array",
      });

      const blob = new Blob([excelBuffer], {
        type: "application/octet-stream",
      });
      saveAs(
        blob,
        `${filterBy.search && `${filterBy.search}-`}${
          filterBy?.edited_transaction_start_date &&
          filterBy?.edited_transaction_end_date &&
          `Transaction-Date-${formatDate(
            filterBy?.edited_transaction_start_date,
            "MMMM-dd-yyyy"
          )}-To-${formatDate(
            filterBy?.edited_transaction_end_date,
            "MMMM-dd-yyyy"
          )}-`
        }${
          filterBy?.created_start_date &&
          filterBy?.created_end_date &&
          `Created-Date-${formatDate(
            filterBy?.created_start_date,
            "MMMM-dd-yyyy"
          )}-To-${formatDate(filterBy?.created_end_date, "MMMM-dd-yyyy")}-`
        }${
          filterBy?.edited_start_date &&
          filterBy?.edited_end_date &&
          `Edited-Date-${formatDate(
            filterBy?.edited_start_date,
            "MMMM-dd-yyyy"
          )}-To-${formatDate(filterBy?.edited_end_date, "MMMM-dd-yyyy")}-`
        }Ticketing-Report.xlsx`
      );
      toast.success("Succes", {
        description: "Report has been exported successfully",
        position: "bottom-center",
      });
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoadingToExport(false);
    }
  };

  const handleOpenDrawer = (data: any) => () => {
    setSelectedData(data);
    setIsOpenDrawer(true);
  };

  return (
    <div className="flex flex-col gap-3">
      <Card className="gap-0">
        <CardHeader>
          <CardTitle className="font-bold text-lg text-gray-600 flex items-center gap-1">
            <Funnel size={18} />
            <span>Filter</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full flex gap-2 flex-col space-y-5">
            <SelectFilter
              forFilterData={forFilterData}
              isLoading={isLoadingForFilter}
              handleSelectFilter={handleSelectFilter}
              filterBy={filterBy}
              handleSearchTerm={handleSearchTerm}
            />
            <DateFilter
              filterBy={filterBy}
              handleDateFilter={handleDateFilter}
            />
            <div className="w-full flex justify-end">
              <Button
                type="button"
                onClick={handleReset}
                variant="ghost"
                className="bg-yellow-400 text-white hover:bg-yellow-500 hover:text-white"
              >
                Reset
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card className="gap-0">
        <CardHeader className="flex items-center justify-between">
          <CardTitle className="font-bold text-lg text-gray-600 flex items-center gap-1">
            <File size={18} />
            <span>Reports</span>
          </CardTitle>
          {data?.data?.data && data?.data?.data?.length !== 0 && (
            <Button
              type="button"
              variant={"ghost"}
              onClick={handleGenerate}
              disabled={isLoadingToExport || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2Icon className="animate-spin" /> Generating...
                </>
              ) : isLoadingToExport ? (
                <>
                  <Loader2Icon className="animate-spin" /> Exporting...
                </>
              ) : (
                <>
                  <FileOutput /> Export
                </>
              )}
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <DataTableComponent
            data={data?.data?.data}
            columns={[...REPORTS_COLUMNS, ...REPORTS_COLUMNS_ACTIONS]}
            loading={isLoading}
            handlePageChange={handlePageChange}
            handlePerPageChange={handlePerPageChange}
            handleShort={handleShort}
            column={pagination.sortBy}
            direction={pagination.sortDirection}
            pageTotal={pagination.totalRecords}
            searchTerm={filterBy.search}
            perPage={pagination.perPage}
            conditionalRowStyles={conditionalRowStyles}
            currentPage={pagination.page}
          />
        </CardContent>
      </Card>

      <ViewReportDetails
        data={selectedData}
        open={isOpenDrawer}
        setIsOpen={setIsOpenDrawer}
      />
    </div>
  );
}

export default withAuthPage(Reports);
