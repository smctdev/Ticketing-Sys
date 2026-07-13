import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import nameShortHand from "@/utils/name-short-hand";
import Storage from "@/utils/storage";

export const USERS_COLUMNS = [
  {
    name: "Full Name",
    cell: (row: any) => (
      <div className="flex items-center gap-1">
        <Avatar>
          <AvatarImage
            src={Storage(row?.user_detail?.profile_pic)}
            alt={row.full_name}
          />
          <AvatarFallback className="font-bold text-gray-600 dark:text-gray-300">
            {nameShortHand(row?.full_name)}
          </AvatarFallback>
        </Avatar>
        <span className="text-gray-600 dark:text-gray-300 font-bold text-xs">
          {row.full_name}
        </span>
      </div>
    ),
    sortable: false,
  },
  {
    name: "Branch Code",
    cell: (row: any) => (
      <>
        {row?.branch ? (
          <span
            className={`px-2 py-1 text-[10px] font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-700 dark:text-blue-300`}
          >
            {row?.branch?.b_code}
          </span>
        ) : (
          <span className="flex gap-1 items-start flex-wrap py-2 max-w-[350px]">
            {row?.branches?.map((branch: any, index: number) => (
              <span
                key={index}
                className={`px-2 py-1 text-[10px] font-medium text-blue-800 bg-blue-100 rounded-full dark:bg-blue-700 dark:text-blue-300`}
              >
                {branch?.b_code}
              </span>
            ))}
          </span>
        )}
      </>
    ),
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
