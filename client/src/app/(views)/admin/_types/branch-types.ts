import { Dispatch, SetStateAction } from "react";

export interface BranchFormDataType {
  branch_name: string;
  branch_code: string;
  category: string;
  branch_address: string;
  branch_contact_number: string;
  branch_email: string;
}

export interface BranchDataType {
  blist_id: number;
  b_code: string;
  b_name: string;
  category: string;
}

export interface BranchDetailDataType {
  bdetails_id: number;
  b_address: string;
  b_contact: string;
  b_email: string;
  blist_id: number;
  branch: BranchDataType;
}

export interface EditBranchProps {
  data: BranchDetailDataType;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
  open: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
}

export interface DeleteBranchProps {
  data: BranchDetailDataType;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
}

export interface AddBranchProps {
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
}
