import type { Employee } from '../types';
import { EMPLOYEES, reportsOf } from '../data/org';

// Mô phỏng mô hình "vai trò × phạm vi dữ liệu" trong docs/03-kien-truc-ky-thuat.md, mục 4.

const isCompanyWide = (e: Employee) => e.role === 'hr' || e.role === 'director';

/** Danh sách nhân viên người dùng được xem đầy đủ hồ sơ / bảng công */
export function managedEmployees(viewer: Employee): Employee[] {
  if (isCompanyWide(viewer)) return EMPLOYEES;
  return [viewer, ...reportsOf(viewer.id)];
}

export function profileAccess(viewer: Employee, target: Employee): 'full' | 'basic' {
  return managedEmployees(viewer).some((e) => e.id === target.id) ? 'full' : 'basic';
}

/** Lương là quyền riêng: chỉ chính chủ, HCNS và Ban Giám đốc */
export function canSeeSalary(viewer: Employee, target: Employee): boolean {
  return viewer.id === target.id || isCompanyWide(viewer);
}

export const canLockTimesheet = (viewer: Employee) => viewer.role === 'hr';
export const canProxyCheckIn = (viewer: Employee) => viewer.role === 'site_manager';
export const seesAllRequests = (viewer: Employee) => isCompanyWide(viewer) || viewer.role === 'chief_accountant';
