import { PAGINATION } from "@/constants/pagination";
import { TICKET_STATUS } from "@/constants/ticket-status";
import { useIsRefresh } from "@/context/is-refresh-context";
import { api } from "@/lib/api";
import { PaginationType } from "@/types/pagination-type";
import { UseFetchDataType, UseFetchType } from "@/types/use-fetch-type";
import formattedDate from "@/utils/format-date";
import { usePathname, useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";
import { ChangeEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import Swal from "sweetalert2";

export default function useFetch({
  url,
  isPaginated = false,
  filters = false,
  canBeRefreshGlobal = false,
}: UseFetchDataType): UseFetchType {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const status = searchParams.get("status") ?? "";
  const [data, setData] = useState<any>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<null | string>(null);
  const [pagination, setPagination] = useState<PaginationType>(PAGINATION);
  const [filterBy, setFilterBy] = useState<any>({
    ...filters,
    status: [TICKET_STATUS.PENDING, TICKET_STATUS.REJECTED].includes(status)
      ? status
      : "ALL",
  });
  const [isFiltered, setIsFiltered] = useState<boolean>(false);
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const [errorStatus, setErrorStatus] = useState<number | null>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const { setIsRefresh: setRefresh } = useIsRefresh();
  const errorRef = useRef<boolean>(false);
  const router = useRouter();

  useEffect(() => {
    fetchData();
  }, [
    pagination?.page,
    pagination?.perPage,
    // pagination?.sortBy,
    // pagination.sortDirection,
    isPaginated,
    filterBy.status,
    filterBy.search,
    filterBy.isLoading,
    filterBy.branch_code,
    filterBy.branch_type,
    filterBy.ticket_category,
    filterBy.edited_end_date,
    filterBy.edited_start_date,
    filterBy.edited_transaction_end_date,
    filterBy.edited_transaction_start_date,
    filterBy.created_end_date,
    filterBy.created_start_date,
    filterBy.ticket_type,
    isRefresh,
    canBeRefreshGlobal,
    status,
  ]);

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
      if (!error.response && !errorRef.current) {
        Swal.fire({
          icon: "error",
          title: error.code || "Server Error",
          confirmButtonColor: "#1e88e5",
          confirmButtonText: "Ok",
          html: `${error.message || "Something went wrong."}<br>Please try again later.<br>Thank you!`,
        });
        setError(
          `${error.message || "Something went wrong."} Please try again later. Thank you!`,
        );
        errorRef.current = true;
      }

      if (error?.response?.status === 429 && !errorRef.current) {
        toast.error(error?.code, {
          position: "bottom-center",
          description: `${error?.response?.data?.message || "Something went wrong."} Please try again later.`,
        });
        setError(`${error?.response?.data?.message} Please try again later.`);
        errorRef.current = true;
      }

      setError(
        `${error?.response?.data?.message || "Something went wrong."} Please try again later.`,
      );
      setErrorStatus(error?.response?.status);
      setData([]);
    } finally {
      setIsLoading(false);
      setIsRefresh(false);
      if (isPaginated) {
        setPagination((pagination) => ({
          ...pagination,
          isLoading: false,
        }));
      }
      setRefresh(false);
    }
  };

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
    if (router && status) {
      router.replace(pathname);
    }
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
    setIsLoading,
    errorStatus,
    fetchData,
  };
}
