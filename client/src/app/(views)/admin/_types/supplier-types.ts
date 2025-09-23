import { Dispatch, SetStateAction } from "react";

export interface SupplierFormDataType {
  suppliers: string;
}

export interface SupplierDataType {
  id: number;
  suppliers: string;
}

export interface EditSupplierProps {
  data: SupplierDataType;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
}

export interface DeleteSupplierProps {
  data: SupplierDataType;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
}

export interface AddSupplierProps {
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
}
