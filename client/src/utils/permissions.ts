import { ROLE } from "../constants/roles";

export const canCreateTicket = (userRole: string) => {
  return [ROLE.USER, ROLE.ACCOUNTING_STAFF, ROLE.BRANCH_HEAD].includes(
    userRole,
  );
};
