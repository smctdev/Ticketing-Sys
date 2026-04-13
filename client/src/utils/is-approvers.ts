import { ROLE } from "@/constants/roles";

export const isApprovers = (role: string) => {
  const approverRoles = [
    ROLE.AUTOMATION,
    ROLE.AUTOMATION_MANAGER,
    ROLE.AUTOMATION_ADMIN,
    ROLE.ADMIN,
    ROLE.BRANCH_HEAD,
    ROLE.ACCOUNTING_HEAD,
    ROLE.ACCOUNTING_STAFF,
  ];
  return approverRoles.includes(role);
};

export const isAccountingApprover = (role: string) => {
  const approverRoles = [ROLE.ACCOUNTING_HEAD, ROLE.ACCOUNTING_STAFF];

  return approverRoles.includes(role);
};

export const isAccountingStaff = (role: string) => {
  const approverRoles = [ROLE.ACCOUNTING_STAFF];

  return approverRoles.includes(role);
};

export const isAutomationManager = (role: string) => {
  const automationRoles = [ROLE.AUTOMATION_MANAGER, ROLE.AUTOMATION_ADMIN];

  return automationRoles.includes(role);
};

export const isAutomation = (role: string) => {
  const automationRoles = [ROLE.AUTOMATION];

  return automationRoles.includes(role);
};
