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
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
}

export interface DeleteUserRoleProps {
  data: UserRoleDataType;
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
}

export interface AddUserRoleProps {
  setIsRefresh: Dispatch<SetStateAction<boolean>>;
}
