import { ChangeEvent } from "react";

export interface FormInputGroupTypes {
  title: string;
  type: string;
  error: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  value: string;
  placeholder: string;
  isOptional?: boolean;
}

export interface UserFormItemsTypes {
  first_name: string;
  last_name: string;
  contact_number: string;
  email: string;
  password: string;
  username: string;
  role: number | string;
  branch_code: number | string;
}
