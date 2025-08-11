import { ChangeEvent } from "react";

export interface UseFetchType {
  data: any;
  isLoading: boolean;
  error: any;
  handleSearchTerm: (
    debounce?: number
  ) => (e: ChangeEvent<HTMLInputElement>) => void;
  handlePageChange: (newPage: number | string) => void;
  handlePerPageChange: (perPage: number | string) => void;
  handleShort: (column: any, direction: any) => void;
}
