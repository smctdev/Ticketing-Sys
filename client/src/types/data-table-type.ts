import { ConditionalStyles } from "react-data-table-component";

export interface DataTableType {
  data: any;
  columns: any;
  loading?: boolean;
  pageTotal?: any;
  direction?: any;
  column?: any;
  handlePageChange?: (newPage: number | string) => void;
  handlePerPageChange?: (perPage: number | string) => void;
  handleShort?: (column: any, direction: any) => void;
  perPage?: any;
  searchTerm?: string;
  conditionalRowStyles?: ConditionalStyles<unknown>[] | undefined;
  currentPage?: any;
}
