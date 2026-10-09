import { describe, expect, it } from 'vitest';
import dayjs from 'dayjs';
import { dayCell, demoMissingDate, summarize } from './attendance';
import { countWorkdays } from './calendar';
import { distanceMeters, offsetNorth } from './geo';
import { getEmployee, getSite } from '../data/org';
import { buildSeed } from '../store/seed';
import type { LeaveRequest } from '../types';

const TODAY = dayjs().format('YYYY-MM-DD');
const an = getEmployee('E005');

describe('lịch làm việc', () => {
  it('công trường làm thứ 2–7, văn phòng thứ 2–6', () => {
    // 05/10/2026 là thứ Hai
    expect(countWorkdays('2026-10-05', '2026-10-11', getSite('P01').shift)).toBe(6);
    expect(countWorkdays('2026-10-05', '2026-10-11', getSite('VP').shift)).toBe(5);
  });
  it('trừ ngày lễ cố định', () => {
    expect(countWorkdays('2026-09-01', '2026-09-03', getSite('VP').shift)).toBe(2);
  });
});

describe('geofence', () => {
  it('khoảng cách haversine', () => {
    const site = getSite('P01');
    expect(Math.round(distanceMeters(site, offsetNorth(site, 250)))).toBe(250);
  });
});

describe('bảng công', () => {
  const missing = demoMissingDate(an);

  it('ngày quên chấm công của An cần giải trình', () => {
    expect(dayCell(an, missing, [], [], TODAY).tone).toBe('missing');
  });

  it('giải trình được duyệt thì thành đủ công', () => {
    const { leaves } = buildSeed();
    const explained: LeaveRequest = {
      ...leaves[0],
      id: 'X',
      type: 'missing_checkin',
      from: missing,
      to: missing,
      time: '17:30',
      workflow: { ...leaves[0].workflow, status: 'approved' },
    };
    const cell = dayCell(an, missing, [explained], [], TODAY);
    expect(cell).toMatchObject({ code: 'X', checkOut: '17:30' });
  });

  it('ngày phép đã duyệt hiện "P"', () => {
    const { leaves } = buildSeed();
    const l = leaves.find((x) => x.id === 'L0001')!;
    expect(dayCell(an, l.from, leaves, [], TODAY).code).toBe('P');
  });

  it('chấm công hôm nay được ghi nhận', () => {
    const cell = dayCell(an, TODAY, [], [{ employeeId: 'E005', date: TODAY, siteId: 'P01', checkIn: '06:50', method: 'gps', distanceM: 30 }], TODAY);
    expect(cell.code).toBe('X');
    expect(summarize([cell]).work).toBe(1);
  });
});
