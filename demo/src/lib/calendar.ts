import dayjs from 'dayjs';
import type { Shift } from '../types';
import { ISO } from './format';

/** Ngày lễ dương lịch cố định (MM-DD). Tết âm lịch, Giỗ Tổ… cấu hình theo năm trong bản chính thức. */
const FIXED_HOLIDAYS = ['01-01', '04-30', '05-01', '09-02'];

export const isHoliday = (date: string) => FIXED_HOLIDAYS.includes(dayjs(date).format('MM-DD'));

export function isWorkday(date: string, shift: Shift): boolean {
  return shift.workdays.includes(dayjs(date).day()) && !isHoliday(date);
}

/** Đếm số ngày làm việc trong khoảng [from, to] theo ca làm việc. */
export function countWorkdays(from: string, to: string, shift: Shift): number {
  let n = 0;
  for (let d = dayjs(from); !d.isAfter(dayjs(to), 'day'); d = d.add(1, 'day')) {
    if (isWorkday(d.format(ISO), shift)) n++;
  }
  return n;
}

export function datesInRange(from: string, to: string): string[] {
  const out: string[] = [];
  for (let d = dayjs(from); !d.isAfter(dayjs(to), 'day'); d = d.add(1, 'day')) out.push(d.format(ISO));
  return out;
}
