export interface PaginationType {
  page: number | string;
  perPage: number | string;
  totalRecords: number | string;
  sortBy: string;
  sortDirection: string;
  isLoading: boolean;
}
