import { UserRoleDataType } from "../_types/user-roles-types";

export const USER_ROLES_COLUMNS = [
  {
    name: "ID",
    cell: (row: UserRoleDataType) => row?.user_role_id,
    sortable: false,
    width: "150px"
  },
  {
    name: "Role Name",
    cell: (row: UserRoleDataType) => row?.role_name,
    sortable: false,
  },
];
