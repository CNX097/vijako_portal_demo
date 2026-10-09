import type { WorkflowInstance } from './lib/workflow';

export type RoleKey = 'staff' | 'site_manager' | 'hr' | 'chief_accountant' | 'director';

export interface Shift {
  name: string;
  start: string; // HH:mm
  end: string;
  /** 0 = Chủ nhật … 6 = Thứ bảy */
  workdays: number[];
}

export interface Site {
  id: string;
  name: string;
  address: string;
  kind: 'office' | 'project';
  lat: number;
  lng: number;
  /** bán kính geofence (m) */
  radius: number;
  managerId?: string;
  shift: Shift;
}

export interface Department {
  id: string;
  name: string;
  siteId: string;
}

export interface Contract {
  code: string;
  type: string;
  from: string;
  to?: string;
}

export interface CareerEvent {
  date: string;
  title: string;
  detail: string;
}

export interface Certificate {
  name: string;
  issuer: string;
  issued: string;
  expires?: string;
}

export interface Employee {
  id: string;
  code: string;
  name: string;
  gender: 'Nam' | 'Nữ';
  dob: string;
  phone: string;
  email: string;
  departmentId: string;
  positionCode: string;
  managerId?: string;
  joinDate: string;
  siteId: string;
  idNumber: string;
  address: string;
  bankAccount: string;
  salary: number;
  dependents: number;
  /** số ngày phép năm đã dùng trước khi có dữ liệu trên hệ thống */
  leaveUsedBefore: number;
  contracts: Contract[];
  history: CareerEvent[];
  certificates: Certificate[];
  assets: string[];
  role: RoleKey;
}

export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'business_trip' | 'overtime' | 'missing_checkin';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  type: LeaveType;
  from: string;
  to: string;
  /** số ngày làm việc (với loại nghỉ / công tác) */
  days: number;
  /** số giờ (làm thêm) */
  hours?: number;
  /** giờ ra/vào cần bổ sung (quên chấm công) */
  time?: string;
  reason: string;
  createdAt: string;
  workflow: WorkflowInstance;
}

export interface Proposal {
  id: string;
  code: string;
  templateCode: string;
  requesterId: string;
  title: string;
  amount: number;
  projectId?: string;
  data: Record<string, unknown>;
  createdAt: string;
  workflow: WorkflowInstance;
}

export interface AttendanceEntry {
  employeeId: string;
  date: string;
  siteId: string;
  checkIn?: string;
  checkOut?: string;
  method: 'gps' | 'proxy';
  distanceM?: number;
  byId?: string;
}
