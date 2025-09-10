import DataTableComponent from "@/components/data-table";
import { AUTOMATION_RECORD_COLUMNS } from "../_constants/automation-record-columns";
import { Check } from "lucide-react";

export default function AutomationRecords({ data, loading }: any) {
  return (
    <div className="flex flex-col gap-2 border p-7 rounded-lg border-gray-200 shadow">
      <h3 className="text-md font-bold text-gray-600">Automation Members</h3>
      <p className="flex gap-1 text-xs items-center">
        <Check className="text-blue-400 size-4" />
        <span className="text-gray-600">Ticket done this month</span>
      </p>
      <DataTableComponent
        data={data}
        columns={AUTOMATION_RECORD_COLUMNS}
        isPaginated={false}
        loading={loading}
      />
    </div>
  );
}
