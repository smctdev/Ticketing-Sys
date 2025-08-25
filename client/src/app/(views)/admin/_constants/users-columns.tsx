export const USERS_COLUMNS = [
  {
    name: "Full Name",
    cell: (row: any) => row?.full_name,
    sortable: false,
  },
  {
    name: "Branch Code",
    cell: (row: any) => row?.branch?.b_code,
    sortable: false,
  },
  {
    name: "Email",
    cell: (row: any) => row?.user_detail?.user_email,
    sortable: false,
  },
  {
    name: "Role",
    cell: (row: any) => row?.user_role?.role_name,
    sortable: false,
  },
  {
    name: "Contact",
    cell: (row: any) => row?.user_detail?.user_contact,
    sortable: false,
  },
];
