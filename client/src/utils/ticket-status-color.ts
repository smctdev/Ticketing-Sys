import { TICKET_STATUS } from "@/constants/ticket-status";

const COLORS: Record<string, string> = {
  [TICKET_STATUS.EDITED]: "text-blue-600 bg-blue-100",
  [TICKET_STATUS.REJECTED]: "text-red-600 bg-red-100",
  [TICKET_STATUS.PENDING]: "text-yellow-600 bg-yellow-100",
  DEFAULT: "text-gray-600 bg-gray-100",
};

export default function statusColor(status: string) {
  return COLORS[status] || COLORS.DEFAULT;
}
