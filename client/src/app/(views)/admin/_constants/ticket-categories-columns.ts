export const TICKET_CATEGORIES_COLUMNS = [
  {
    name: "Alias",
    cell: (row: any) => row?.category_shortcut,
    sortable: false,
  },
  {
    name: "Category",
    cell: (row: any) => row?.category_name,
    sortable: false,
  },
  {
    name: "Approver",
    cell: (row: any) => row?.group_category?.group_code,
    sortable: false,
  },
];
