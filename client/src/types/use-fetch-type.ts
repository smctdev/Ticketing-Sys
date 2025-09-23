import { ChangeEvent, Dispatch, SetStateAction } from "react";
import { PaginationType } from "./pagination-type";

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
  filterBy: any;
  pagination: PaginationType;
  handleSelectFilter: (item: string) => (e: any) => void;
  handleDateFilter: (item: string) => (e: any) => void;
  handleReset: () => void;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
  isRefresh: boolean;
}

export interface FilterByType {
  status: string;
  search: string;
  defaultSearchValue: string;
}

export interface UseFetchDataType {
  url: string;
  isPaginated?: boolean;
  filters?: any;
  canBeRefreshGlobal?: boolean;
}
