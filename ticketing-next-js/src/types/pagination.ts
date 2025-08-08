export interface PaginationType {
  page: number;
  perPage: number;
  totalRecords: number;
  sortBy: string;
  sortDirection: string;
  isLoading: boolean;
}
