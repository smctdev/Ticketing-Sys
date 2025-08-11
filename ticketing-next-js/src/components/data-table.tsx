import { paginationRowsPerPageOptions } from "@/constants/pagination-rows-per-page-options";
import TableLoader from "./loaders/table-loader";
import DataTable from "react-data-table-component";
import { DataTableType } from "@/types/data-table-type";
import useFetch from "@/hooks/use-fetch";

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
}: DataTableType) {
  const NoData = () => {
    return (
      <div className="py-10">
        {searchTerm ? `No results for "${searchTerm}"` : "No data available"}
      </div>
    );
  };

  return (
    <DataTable
      data={data}
      columns={columns}
      pagination
      paginationServer
      striped
      highlightOnHover
      progressPending={loading}
      progressComponent={<TableLoader colSpan={columns.length} />}
      sortServer
      onSort={handleShort}
      paginationTotalRows={pageTotal}
      defaultSortAsc={direction}
      defaultSortFieldId={column}
      paginationRowsPerPageOptions={paginationRowsPerPageOptions}
      onChangePage={handlePageChange}
      onChangeRowsPerPage={handlePerPageChange}
      persistTableHead={true}
      noDataComponent={<NoData />}
      paginationPerPage={perPage}
    />
  );
}
