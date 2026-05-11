import { ROLE_ACTIONS } from '../constants/ui';

export function canRolePerform(user: any, action: string, tab: string) {
  if (!user?.role || !tab) return false;
  if (["backup", "restore", "reset"].includes(tab) && user.role !== "superAdmin") return false;
  if (tab === "payments" && !canUserViewFinance(user)) return false;
  if (action === "delete" && tab === "subjects") return false;
  
  const permission = (ROLE_ACTIONS as any)[user.role]?.[action];
  if (permission === "all") return true;
  return Array.isArray(permission) && permission.includes(tab);
}

export function canUserViewFinance(user: any) {
  return ["superAdmin", "admin", "secretariat"].includes(user?.role) || 
         ["managePayments", "viewFinanceReports"].some((permission) => user?.permissions?.includes(permission));
}

export function canUserManagePreEnrollments(user: any) {
  return ["superAdmin", "admin", "secretariat"].includes(user?.role) || 
         user?.permissions?.includes("manageEnrollments");
}

