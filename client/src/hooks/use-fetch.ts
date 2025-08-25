import { PAGINATION } from "@/constants/pagination";
import { api } from "@/lib/api";
import { PaginationType } from "@/types/pagination-type";
import { UseFetchType } from "@/types/use-fetch-type";
import formattedDate from "@/utils/format-date";
import { ChangeEvent, useEffect, useRef, useState } from "react";

export default function useFetch({
  url,
  isPaginated = false,
  filters = false,
}: {
  url: string;
  isPaginated?: boolean;
  filters?: any;
}): UseFetchType {
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);
  const [pagination, setPagination] = useState<PaginationType>(PAGINATION);
  const [filterBy, setFilterBy] = useState<any>(filters);
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { defaultSearchValue, ...filteredData } = filterBy;
      const payload = {
        page: pagination.page,
        limit: pagination.perPage,
        // sortBy: pagination.sortBy,
        // sortDirection: pagination.sortDirection,
        ...filteredData,
      };
      try {
        const response = await api.get(url, {
          params: isPaginated ? payload : {},
        });
        if (response.status === 200) {
          setData(response.data);
          setPagination((pagination) => ({
            ...pagination,
            totalRecords: response?.data?.data?.total,
          }));
        }
      } catch (error: any) {
        console.error("Error fetching data:", error);
        setError(error.response.data);
      } finally {
        setIsLoading(false);
        if (isPaginated) {
          setPagination((pagination) => ({
            ...pagination,
            isLoading: false,
          }));
        }
      }
    };

    fetchData();
  }, [
    pagination?.page,
    pagination?.perPage,
    // pagination?.sortBy,
    // pagination.sortDirection,
    isPaginated,
    filterBy.status,
    filterBy.search,
    filterBy.branch_code,
    filterBy.branch_type,
    filterBy.ticket_category,
    filterBy.edited_end_date,
    filterBy.edited_start_date,
    filterBy.edited_transaction_end_date,
    filterBy.edited_transaction_start_date,
    isRefresh,
  ]);

  const handleSearchTerm =
    (debounce = 2000) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setFilterBy((filterBy: any) => ({
        ...filterBy,
        defaultSearchValue: value,
      }));

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        setFilterBy((filterBy: any) => ({
          ...filterBy,
          search: value,
        }));
        setIsLoading(true);
        setIsFiltered(true);
      }, debounce);
    };

  const handlePageChange = (newPage: number | string) => {
    setPagination((pagination) => ({
      ...pagination,
      page: newPage,
      isLoading: true,
    }));
    setIsLoading(true);
  };

  const handleSelectFilter = (item: string) => (value: any) => {
    setFilterBy((filterBy: any) => ({
      ...filterBy,
      [item]: value,
    }));
    setIsLoading(true);
    setIsFiltered(true);
  };

  const handleDateFilter = (item: string) => (value: any) => {
    setFilterBy((filterBy: any) => ({
      ...filterBy,
      [item]: formattedDate(value) || "",
    }));
    setIsLoading(true);
    setIsFiltered(true);
  };

  const handlePerPageChange = (perPage: number | string) => {
    setPagination((pagination) => ({
      ...pagination,
      perPage: perPage,
      page: 1,
    }));
    setIsLoading(true);
  };

  console.log("pagination", pagination);

  const handleShort = (column: any, direction: any) => {
    setPagination((pagination) => ({
      ...pagination,
      sortBy: column.sortField,
      sortDirection: direction,
    }));
    setIsLoading(true);
  };

  const handleReset = () => {
    setFilterBy(filters);
    if (isFiltered) {
      setIsLoading(true);
      setIsFiltered(false);
    }
  };

  return {
    data,
    isLoading,
    error,
    handleSearchTerm,
    handlePageChange,
    handlePerPageChange,
    handleShort,
    filterBy,
    pagination,
    handleSelectFilter,
    handleDateFilter,
    handleReset,
    setIsRefresh,
    isRefresh,
  };
}
