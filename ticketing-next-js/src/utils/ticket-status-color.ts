import { TICKET_STATUS } from "@/constants/ticket-status";

export default function statusColor(status: any) {
  switch (status) {
    case TICKET_STATUS.EDITED:
      return "text-blue-600 bg-blue-100";
    case TICKET_STATUS.REJECTED:
      return "text-red-600 bg-red-100";
    case TICKET_STATUS.PENDING:
      return "text-yellow-600 bg-yellow-100";
    default:
      return "text-gray-600 bg-gray-100";
  }
}
