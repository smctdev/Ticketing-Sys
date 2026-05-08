import { Dispatch, SetStateAction } from "react";

export interface CategoryFormDataType {
  category_shortcut: string;
  category_name: string;
  group_code: string;
  show_hide: string;
  other_category?: string;
  category_type: string;
}

export interface CategoryDataType {
  ticket_category_id: number;
  category_shortcut: string;
  category_name: string;
  group_code: string;
  show_hide: string;
  category_type: string;
}

export interface GroupCategoryDataType {
  id: string | number;
  group_code: string;
}

export interface EditCategoryProps {
  data: CategoryDataType;
  groupCategories: GroupCategoryDataType[];
  isLoadingGroupCategories: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  fetchData: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export interface DeleteCategoryProps {
  data: CategoryDataType;
  fetchData: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}

export interface AddCategoryProps {
  groupCategories: GroupCategoryDataType[];
  isLoadingGroupCategories: boolean;
  fetchData: () => Promise<void>;
  fetchCategories: () => Promise<void>;
}
