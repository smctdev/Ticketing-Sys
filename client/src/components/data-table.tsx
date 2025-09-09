import { paginationRowsPerPageOptions } from "@/constants/pagination-rows-per-page-options";
import TableLoader from "./loaders/table-loader";
import DataTable from "react-data-table-component";
import { DataTableType } from "@/types/data-table-type";

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
}: DataTableType) {
  const NoData = () => {
    return (
      <div className="py-10 text-sm font-bold text-gray-600">
        {searchTerm ? `No results for "${searchTerm}"` : "No data available"}
      </div>
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
      persistTableHead={true}
      noDataComponent={<NoData />}
      paginationPerPage={perPage}
      conditionalRowStyles={conditionalRowStyles}
      paginationDefaultPage={currentPage}
      responsive={true}
    />
  );
}
