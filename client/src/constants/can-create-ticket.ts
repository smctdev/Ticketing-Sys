import { ROLE } from "./roles";

export const canCreateTicket = (userRole: string) => {
  switch (userRole) {
    case ROLE.USER:
    case ROLE.ACCOUNTING_STAFF:
    case ROLE.BRANCH_HEAD:
      return true;
    default:
      return false;
  }
};
