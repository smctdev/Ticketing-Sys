import { Dispatch, SetStateAction } from "react";

export interface UserRoleFormDataType {
  role_name: string;
}

export interface UserRoleDataType {
  user_role_id: number;
  role_name: string;
}

export interface EditUserRoleProps {
  data: UserRoleDataType;
  fetchData: () => Promise<void>;
}

export interface DeleteUserRoleProps {
  data: UserRoleDataType;
  fetchData: () => Promise<void>;
}

export interface AddUserRoleProps {
  fetchData: () => Promise<void>;
}
