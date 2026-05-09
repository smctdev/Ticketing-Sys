import { api } from "@/lib/api";
import { Dispatch, SetStateAction, useEffect, useState } from "react";

const CURSOR_ITEMS = {
  prev_cursor: null,
  next_cursor: null,
  active_cursor: null,
};

interface CursorType {
  prev_cursor: string | null;
  next_cursor: string | null;
  active_cursor: string | null;
}

interface CursorTypes {
  isRefresh: boolean;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
  isLoading: boolean;
  setIsLoading: Dispatch<SetStateAction<boolean>>;
  cursor: CursorType;
  setCursor: Dispatch<SetStateAction<CursorType>>;
  data: any[];
  setData: Dispatch<SetStateAction<any[]>>;
  handleCursor: (title: "next" | "prev") => () => void;
  fetchData: () => Promise<void>;
}

export const useFetchCursor = ({ url }: { url: string }): CursorTypes => {
  const [isRefresh, setIsRefresh] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [cursor, setCursor] = useState<CursorType>(CURSOR_ITEMS);
  const [data, setData] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [isRefresh, cursor.active_cursor]);

  const fetchData = async () => {
    const params = {
      cursor: cursor.active_cursor,
    };
    try {
      const response = await api.get(url, { params });
      if (response.status === 200) {
        setData(response.data.data.data);
        setCursor((cursor) => ({
          ...cursor,
          prev_cursor: response.data.data.prev_cursor,
          next_cursor: response.data.data.next_cursor,
        }));
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCursor = (title: "next" | "prev") => () => {
    if (isLoading) return;
    setIsLoading(true);
    setCursor((cursor) => ({
      ...cursor,
      active_cursor: title === "next" ? cursor.next_cursor : cursor.prev_cursor,
    }));
  };

  return {
    isRefresh,
    setIsRefresh,
    isLoading,
    setIsLoading,
    cursor,
    setCursor,
    data,
    setData,
    handleCursor,
    fetchData,
  };
};
