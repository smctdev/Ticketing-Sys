import { FILTER_BY } from "@/constants/filter-by";
import { PAGINATION } from "@/constants/pagination";
import { api } from "@/lib/api";
import { PaginationType } from "@/types/pagination-type";
import { FilterByType, UseFetchType } from "@/types/use-fetch-type";
import { ChangeEvent, useEffect, useRef, useState } from "react";

export default function useFetch({
  url,
  isPaginated = false,
}: {
  url: string;
  isPaginated?: boolean;
}): UseFetchType {
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);
  const [pagination, setPagination] = useState<PaginationType>(PAGINATION);
  const [filterBy, setFilterBy] = useState<FilterByType>(FILTER_BY);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const payload = {
        page: pagination.page,
        limit: pagination.perPage,
        sortBy: pagination.sortBy,
        sortDirection: pagination.sortDirection,
        search: filterBy.search,
        filter_by: filterBy.status,
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
    pagination?.sortBy,
    pagination.sortDirection,
    isPaginated,
    filterBy.search,
    filterBy.status,
  ]);

  const handleSearchTerm =
    (debounce = 2000) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;

      setFilterBy((filterBy) => ({
        ...filterBy,
        defaultSearchValue: value,
      }));

      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        setFilterBy((filterBy) => ({
          ...filterBy,
          search: value,
        }));
        setIsLoading(true);
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

  const handleFilter = (value: any) => {
    setFilterBy((filterBy) => ({
      ...filterBy,
      status: value,
    }));
    setIsLoading(true);
  };

  const handlePerPageChange = (perPage: number | string) => {
    setPagination((pagination) => ({
      ...pagination,
      perPage: perPage,
      page: 1,
    }));
    setIsLoading(true);
  };

  const handleShort = (column: any, direction: any) => {
    setPagination((pagination) => ({
      ...pagination,
      sortBy: column.sortField,
      sortDirection: direction,
    }));
    setIsLoading(true);
  };

  const handleReset = () => {
    setFilterBy(FILTER_BY);
    if (filterBy.status !== "ALL" || filterBy.search) {
      setIsLoading(true);
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
    handleFilter,
    handleReset,
  };
}
