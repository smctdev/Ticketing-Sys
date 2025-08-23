export const BRANCHES_COLUMNS = [
  {
    name: "Branch Name",
    cell: (row: any) => (
      <div>
        {row.branch.b_name}{" "}
        <span className="font-bold">({row.branch.b_code})</span>
      </div>
    ),
    sortable: false,
  },
  {
    name: "Type",
    cell: (row: any) => row.branch.category,
    sortable: false,
    width: "100px",
  },
  {
    name: "Address",
    cell: (row: any) => row.b_address,
    sortable: false,
  },
  {
    name: "Contacts",
    cell: (row: any) => (
      <div>
        <p>{row.b_email}</p>
        <p>{row.b_contact}</p>
      </div>
    ),
    sortable: false,
  },
];
