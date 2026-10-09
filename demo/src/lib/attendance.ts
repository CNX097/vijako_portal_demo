import dayjs from 'dayjs';
import type { AttendanceEntry, Employee, LeaveRequest } from '../types';
import { getSite, shiftOf } from '../data/org';
import { LEAVE_TYPES } from '../data/workflows';
import { isHoliday, isWorkday } from './calendar';
import { ISO, fromMinutes, seededRandom, toMinutes } from './format';

export type CellTone = 'ok' | 'late' | 'leave' | 'missing' | 'off' | 'holiday' | 'future';

export interface DayCell {
  date: string;
  code: string;
  tone: CellTone;
  checkIn?: string;
  checkOut?: string;
  method?: 'device' | 'gps' | 'proxy';
  distanceM?: number;
  note?: string;
}

const GRACE_MIN = 5;

/** Ngày "quên chấm công ra" cố định của Nguyễn Văn An — dùng cho kịch bản giải trình công. */
export function demoMissingDate(employee: Employee, todayStr = dayjs().format(ISO)): string {
  let d = dayjs(todayStr).subtract(1, 'day');
  let found = 0;
  for (let i = 0; i < 30; i++, d = d.subtract(1, 'day')) {
    if (isWorkday(d.format(ISO), shiftOf(employee)) && ++found === 2) break;
  }
  return d.format(ISO);
}

/** Dữ liệu chấm công lịch sử được sinh ổn định theo (nhân viên, ngày) — thay cho dữ liệu đồng bộ từ máy chấm công / app. */
function generated(emp: Employee, date: string, todayStr: string) {
  const shift = shiftOf(emp);
  const r = seededRandom(`${emp.id}|${date}`);
  const start = toMinutes(shift.start);
  const end = toMinutes(shift.end);
  const late = r() < 0.07;
  const checkIn = late ? start + GRACE_MIN + 1 + Math.floor(r() * 30) : start - 25 + Math.floor(r() * 29);
  const missingOut = r() < 0.02 || (emp.id === 'E005' && date === demoMissingDate(emp, todayStr));
  const checkOut = end + Math.floor(r() * 45);
  const isOffice = getSite(emp.siteId).kind === 'office';
  return {
    checkIn: fromMinutes(checkIn),
    checkOut: missingOut ? undefined : fromMinutes(checkOut),
    method: (isOffice ? 'device' : 'gps') as DayCell['method'],
    distanceM: isOffice ? undefined : Math.floor(r() * 120) + 10,
  };
}

export function isLate(emp: Employee, checkIn?: string): boolean {
  return !!checkIn && toMinutes(checkIn) > toMinutes(shiftOf(emp).start) + GRACE_MIN;
}

export function approvedLeaveOn(emp: Employee, date: string, leaves: LeaveRequest[]): LeaveRequest | undefined {
  return leaves.find(
    (l) =>
      l.employeeId === emp.id &&
      l.workflow.status === 'approved' &&
      LEAVE_TYPES[l.type].kind === 'range' &&
      date >= l.from &&
      date <= l.to,
  );
}

export function dayCell(
  emp: Employee,
  date: string,
  leaves: LeaveRequest[],
  entries: AttendanceEntry[],
  todayStr = dayjs().format(ISO),
): DayCell {
  const shift = shiftOf(emp);
  const entry = entries.find((e) => e.employeeId === emp.id && e.date === date);
  const workday = isWorkday(date, shift);

  const leave = workday ? approvedLeaveOn(emp, date, leaves) : undefined;
  if (leave) {
    const t = LEAVE_TYPES[leave.type];
    return { date, code: t.short, tone: 'leave', note: `${t.label} — đã duyệt` };
  }

  let rec: Omit<DayCell, 'date' | 'code' | 'tone'> | undefined;
  if (entry?.checkIn) {
    rec = {
      checkIn: entry.checkIn,
      checkOut: entry.checkOut,
      method: entry.method,
      distanceM: entry.distanceM,
      note: entry.method === 'proxy' ? 'Chỉ huy trưởng chấm công hộ' : undefined,
    };
  } else if (workday && date < todayStr) {
    rec = generated(emp, date, todayStr);
  }

  if (!rec) {
    if (isHoliday(date)) return { date, code: 'L', tone: 'holiday', note: 'Ngày lễ' };
    if (!workday) return { date, code: '', tone: 'off', note: 'Ngày nghỉ theo ca' };
    return { date, code: '', tone: 'future', note: date === todayStr ? 'Chưa chấm công' : undefined };
  }

  if (!rec.checkOut && date < todayStr) {
    const explained = leaves.find(
      (l) => l.employeeId === emp.id && l.type === 'missing_checkin' && l.from === date && l.workflow.status === 'approved',
    );
    if (explained) return { date, code: 'X', tone: 'ok', ...rec, checkOut: explained.time, note: 'Thiếu giờ ra — đã giải trình, được duyệt' };
    return { date, code: '?', tone: 'missing', ...rec, note: 'Thiếu giờ ra — cần giải trình' };
  }
  if (isLate(emp, rec.checkIn)) return { date, code: 'M', tone: 'late', ...rec, note: 'Đi muộn' };
  return { date, code: 'X', tone: 'ok', ...rec, note: rec.note ?? (workday ? undefined : 'Làm ngày nghỉ') };
}

export interface MonthSummary {
  work: number;
  late: number;
  leave: number;
  missing: number;
}

export function summarize(cells: DayCell[]): MonthSummary {
  return {
    work: cells.filter((c) => c.tone === 'ok' || c.tone === 'late').length,
    late: cells.filter((c) => c.tone === 'late').length,
    leave: cells.filter((c) => c.tone === 'leave').length,
    missing: cells.filter((c) => c.tone === 'missing').length,
  };
}
