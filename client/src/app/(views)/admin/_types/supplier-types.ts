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
  fetchData: () => Promise<void>;
}

export interface DeleteSupplierProps {
  data: SupplierDataType;
  fetchData: () => Promise<void>;
}

export interface AddSupplierProps {
  fetchData: () => Promise<void>;
}
