import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import nameShortHand from "@/utils/name-short-hand";
import Storage from "@/utils/storage";

const resultColor = (result: string) => {
  return result === "High" ? "text-green-600" : "text-red-600";
};

export const AUTOMATION_RECORD_COLUMNS = [
  {
    name: "NAME",
    cell: (row: any) => (
      <div className="flex items-center gap-1">
        <Avatar>
          <AvatarImage
            src={Storage(row?.profile_picture)}
            alt={row.full_name}
          />
          <AvatarFallback className="font-bold text-gray-600 dark:text-gray-300">
            {nameShortHand(row.full_name)}
          </AvatarFallback>
        </Avatar>
        <span className="text-gray-600 dark:text-gray-300 font-bold text-xs">
          {row.full_name}
        </span>
      </div>
    ),
  },
  {
    name: "MOST EDITED CATEGORY",
    cell: (row: any) => (
      <span className="font-bold text-gray-700 dark:text-gray-100">
        {row.mostUsedCategory.category}
      </span>
    ),
  },
  {
    name: "EDITED THIS MONTH",
    cell: (row: any) => (
      <span className="font-bold text-gray-800 dark:text-gray-200">
        {row.ticketsThisMonth}
      </span>
    ),
  },
  {
    name: "LAST MONTH COMPARISON TICKET",
    cell: (row: any) => (
      <div className="w-full">
        <p className="text-gray-800 dark:text-gray-200 font-semibold text-xs">
          {row.roundedPercentage.toFixed(2)}%{" "}
          <span className="text-[10px] text-gray-600 dark:text-gray-300">
            ({row.ticketsLastMonth} tickets edited last month)
          </span>
        </p>
        <Progress
          value={row?.ticketsThisMonth}
          max={row?.ticketsLastMonth || 100}
          valueColor={row.result === "Low" ? "bg-red-400" : "bg-green-400"}
          className={row.result === "Low" ? "bg-red-200" : "bg-green-200"}
        />
      </div>
    ),
  },
  {
    name: "RESULT",
    cell: (row: any) => (
      <span className={`font-bold ${resultColor(row.result)}`}>
        {row.result}
      </span>
    ),
  },
];
