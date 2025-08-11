export interface DataTableType {
  data: any;
  columns: any;
  loading?: boolean;
  pageTotal?: number;
  direction?: any;
  column?: any;
  handlePageChange?: () => void;
  handlePerPageChange?: () => void;
  handleShort?: () => void;
  perPage?: number;
  searchTerm?: string;
}
