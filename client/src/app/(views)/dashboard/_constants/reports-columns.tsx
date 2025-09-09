export const REPORTS_COLUMNS = [
  {
    name: "Branch Type",
    cell: (row: any) => row.branch_category,
    sortable: false,
    sortField: "ticket_code",
    width: "100px"
  },
  {
    name: "Branch Code",
    cell: (row: any) => `${row.branch_name} - (${row.branch_code})`,
    sortable: false,
    sortField: "user_details.fname",
  },
  {
    name: "Particulars",
    cell: (row: any) => `${row.category_name} - (${row.category_shortcut})`,
    sortable: false,
    sortField: "ticket_categories.category_name",
  },
  {
    name: "Counts",
    cell: (row: any) => row.ticket_count,
    sortable: false,
    sortField: "user_details.fname",
  },
];
