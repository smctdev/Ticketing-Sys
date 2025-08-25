export const SUPPLIERS_COLUMNS = [
  {
    name: "ID",
    cell: (row: any) => row?.id,
    sortable: false,
  },
  {
    name: "Supplier Name",
    cell: (row: any) => row?.suppliers,
    sortable: false,
  },
];
