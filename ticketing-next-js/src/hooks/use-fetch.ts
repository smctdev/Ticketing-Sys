import { PAGINATION } from "@/constants/pagination";
import { api } from "@/lib/api";
import { PaginationType } from "@/types/pagination-type";
import { UseFetchType } from "@/types/use-fetch-type";
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
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [pagination, setPagination] = useState<PaginationType>(PAGINATION);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const payload = {
        page: pagination.page,
        limit: pagination.perPage,
        sortBy: pagination.sortBy,
        sortDirection: pagination.sortDirection,
        search: searchTerm,
      };
      try {
        const response = await api.get(url, {
          params: isPaginated ? payload : {},
        });
        if (response.status === 200) {
          setData(response.data);
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
    searchTerm,
    isPaginated,
  ]);

  const handleSearchTerm =
    (debounce = 2000) =>
    (e: ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      if (debounceRef.current) clearTimeout(debounceRef.current);

      debounceRef.current = setTimeout(() => {
        setSearchTerm(value);
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

  return {
    data,
    isLoading,
    error,
    handleSearchTerm,
    handlePageChange,
    handlePerPageChange,
    handleShort,
  };
}
