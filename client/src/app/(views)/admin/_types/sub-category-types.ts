import { Dispatch, SetStateAction } from "react";

export interface SubCategoryFormDataType {
  sub_category_name: string;
}

export interface SubCategoryDataType {
  id: number;
  ticket_category_id: number;
  sub_category_name: string;
}

export interface EditSubCategoryProps {
  data: SubCategoryDataType;
  fetchData: () => Promise<void>;
}

export interface DeleteSubCategoryProps {
  data: SubCategoryDataType;
  fetchData: () => Promise<void>;
}

export interface AddSubCategoryProps {
  fetchData: () => Promise<void>;
  ticketCategoryId: string | number;
}
