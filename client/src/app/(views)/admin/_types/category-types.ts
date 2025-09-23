import { Dispatch, SetStateAction } from "react";

export interface CategoryFormDataType {
  category_shortcut: string;
  category_name: string;
  group_code: string;
  show_hide: string;
  other_category?: string;
}

export interface CategoryDataType {
  ticket_category_id: number;
  category_shortcut: string;
  category_name: string;
  group_code: string;
  show_hide: string;
}

export interface GroupCategoryDataType {
  id: string | number;
  group_code: string;
}

export interface EditCategoryProps {
  data: CategoryDataType;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
  groupCategories: GroupCategoryDataType[];
  isLoadingGroupCategories: boolean;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface DeleteCategoryProps {
  data: CategoryDataType;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
}

export interface AddCategoryProps {
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
  groupCategories: GroupCategoryDataType[];
  isLoadingGroupCategories: boolean;
}
