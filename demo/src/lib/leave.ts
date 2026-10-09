import dayjs from 'dayjs';
import type { Employee, LeaveRequest } from '../types';
import { annualEntitlement } from '../data/org';

export interface LeaveBalance {
  entitlement: number;
  used: number;
  pending: number;
  remaining: number;
}

/** Quỹ phép năm: 12 ngày + 1 ngày mỗi 5 năm thâm niên (Bộ luật Lao động 2019) */
export function leaveBalance(emp: Employee, leaves: LeaveRequest[]): LeaveBalance {
  const year = dayjs().format('YYYY');
  const annual = leaves.filter((l) => l.employeeId === emp.id && l.type === 'annual' && l.from.startsWith(year));
  const used = emp.leaveUsedBefore + annual.filter((l) => l.workflow.status === 'approved').reduce((s, l) => s + l.days, 0);
  const pending = annual.filter((l) => l.workflow.status === 'pending').reduce((s, l) => s + l.days, 0);
  const entitlement = annualEntitlement(emp);
  return { entitlement, used, pending, remaining: entitlement - used - pending };
}
