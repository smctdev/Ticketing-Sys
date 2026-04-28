import { paginationRowsPerPageOptions } from "@/constants/pagination-rows-per-page-options";
import TableLoader from "./loaders/table-loader";
import DataTable from "react-data-table-component";
import { DataTableType } from "@/types/data-table-type";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "./ui/empty";
import { CopySlash, Search } from "lucide-react";

export default function DataTableComponent({
  data,
  columns,
  loading,
  handleShort,
  pageTotal,
  direction,
  column,
  handlePageChange,
  handlePerPageChange,
  perPage,
  searchTerm,
  conditionalRowStyles,
  currentPage,
  isPaginated = true,
  isFixedHeader = false,
  error,
}: DataTableType) {
  const NoData = () => {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia>
            {searchTerm ? (
              <Search />
            ) : (
              <CopySlash className="size-12 text-muted-foreground/40" />
            )}
          </EmptyMedia>
          <EmptyTitle>
            {" "}
            {searchTerm
              ? `No results for "${searchTerm}"`
              : error
                ? error
                : "No data available"}
          </EmptyTitle>
          <EmptyDescription>
            {`All ${searchTerm ? "searches" : "records"} will appear here. ${
              searchTerm
                ? "Try adjusting your search to find what you're looking for."
                : "Please check back later or adjust your filters."
            }`}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    );
  };

  return (
    <DataTable
      data={data}
      columns={columns}
      pagination={isPaginated}
      paginationServer
      striped
      highlightOnHover
      progressPending={loading}
      progressComponent={<TableLoader colSpan={columns.length} />}
      sortServer
      onSort={handleShort}
      fixedHeader={isFixedHeader}
      paginationTotalRows={pageTotal}
      defaultSortAsc={direction}
      defaultSortFieldId={column}
      paginationRowsPerPageOptions={paginationRowsPerPageOptions}
      onChangePage={handlePageChange}
      onChangeRowsPerPage={handlePerPageChange}
      persistTableHead
      noDataComponent={<NoData />}
      paginationPerPage={perPage}
      conditionalRowStyles={conditionalRowStyles}
      paginationDefaultPage={currentPage}
      responsive
    />
  );
}
