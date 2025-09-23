import { ROLE } from "@/constants/roles";

export const isApprovers = (role: string) => {
  const approverRoles = [
    ROLE.AUTOMATION,
    ROLE.AUTOMATION_MANAGER,
    ROLE.AUTOMATION_ADMIN,
    ROLE.ADMIN,
    ROLE.BRANCH_HEAD,
  ];
  return approverRoles.includes(role);
};

export const isAutomation = (role: string) => {
  const automationRoles = [
    ROLE.AUTOMATION,
    ROLE.AUTOMATION_MANAGER,
    ROLE.AUTOMATION_ADMIN,
  ];

  return automationRoles.includes(role);
};
