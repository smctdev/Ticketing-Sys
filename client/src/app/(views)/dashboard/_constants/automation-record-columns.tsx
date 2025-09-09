import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import nameShortHand from "@/utils/name-short-hand";

const resultColor = (result: string) => {
  return result === "High" ? "text-green-600" : "text-red-600";
};

export const AUTOMATION_RECORD_COLUMNS = [
  {
    name: "NAME",
    cell: (row: any) => (
      <>
        <Avatar>
          <AvatarImage src={row.profile_picture} alt={row.full_name} />
          <AvatarFallback className="font-bold text-gray-600">
            {nameShortHand(row.full_name)}
          </AvatarFallback>
        </Avatar>
        <span className="text-gray-700">{row.full_name}</span>
      </>
    ),
  },
  {
    name: "MOST EDITED CATEGORY",
    cell: (row: any) => (
      <span className="font-bold text-gray-700">
        {row.mostUsedCategory.category}
      </span>
    ),
  },
  {
    name: "EDITED THIS MONTH",
    cell: (row: any) => (
      <span className="font-bold text-gray-800">{row.ticketsThisMonth}</span>
    ),
  },
  {
    name: "LAST MONTH COMPARISON TICKET",
    cell: (row: any) => (
      <div className="w-full">
        <p className="text-gray-800 font-semibold text-xs">
          {row.roundedPercentage.toFixed(2)}%
        </p>
        <Progress
          value={row.ticketsThisMonth}
          max={row.ticketsLastMonth}
          className={row.result === "Low" ? "bg-red-600" : "bg-green-600"}
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
