import dayjs from 'dayjs';
import type { LeaveRequest, Proposal } from '../types';
import { ORG, getEmployee, shiftOf } from '../data/org';
import { LEAVE_TYPES, getTemplate } from '../data/workflows';
import { actOnWorkflow, startWorkflow, type WorkflowInstance } from '../lib/workflow';
import { countWorkdays, isWorkday } from '../lib/calendar';
import { demoMissingDate } from '../lib/attendance';
import { ISO } from '../lib/format';

export interface SeedData {
  leaves: LeaveRequest[];
  proposals: Proposal[];
  seq: number;
}

const ts = (daysAgo: number, time: string) => `${dayjs().subtract(daysAgo, 'day').format(ISO)}T${time}:00`;

/** Áp dụng lần lượt các lượt duyệt [người duyệt, hành động, ghi chú, số ngày trước] */
function walk(wf: WorkflowInstance, acts: [string, 'approve' | 'reject', string | undefined, number][]): WorkflowInstance {
  return acts.reduce((w, [actor, action, comment, daysAgo]) => actOnWorkflow(w, actor, action, ts(daysAgo, '09:15'), comment), wf);
}

function nextWorkday(from: dayjs.Dayjs, employeeId: string, offset = 0): string {
  const shift = shiftOf(getEmployee(employeeId));
  let d = from;
  let n = 0;
  for (let i = 0; i < 30; i++, d = d.add(1, 'day')) {
    if (isWorkday(d.format(ISO), shift) && n++ === offset) break;
  }
  return d.format(ISO);
}

function leave(
  id: string,
  employeeId: string,
  type: LeaveRequest['type'],
  from: string,
  to: string,
  reason: string,
  createdDaysAgo: number,
  acts: [string, 'approve' | 'reject', string | undefined, number][],
  extra: Partial<LeaveRequest> = {},
): LeaveRequest {
  const t = LEAVE_TYPES[type];
  const days = t.kind === 'range' ? countWorkdays(from, to, shiftOf(getEmployee(employeeId))) : 0;
  const createdAt = ts(createdDaysAgo, '08:20');
  const wf = startWorkflow(t.workflow, { requesterId: employeeId, days }, ORG, createdAt);
  return { id, employeeId, type, from, to, days, reason, createdAt, workflow: walk(wf, acts), ...extra };
}

function proposal(
  id: string,
  code: string,
  templateCode: string,
  requesterId: string,
  data: Record<string, unknown>,
  createdDaysAgo: number,
  acts: [string, 'approve' | 'reject', string | undefined, number][],
): Proposal {
  const tpl = getTemplate(templateCode);
  const amount = tpl.amountOf(data);
  const projectId = (data.projectId as string | undefined) || undefined;
  const createdAt = ts(createdDaysAgo, '10:05');
  const wf = startWorkflow(tpl.workflow, { requesterId, amount, projectId }, ORG, createdAt);
  return { id, code, templateCode, requesterId, title: tpl.titleOf(data), amount, projectId, data, createdAt, workflow: walk(wf, acts) };
}

export function buildSeed(): SeedData {
  const today = dayjs();
  const year = today.format('YYYY');
  const an = getEmployee('E005');
  const missing = demoMissingDate(an);

  // Một ngày phép đã duyệt của An trong tháng này (khác ngày quên chấm công) — để bảng công có ô "P"
  const monthStart = today.startOf('month');
  const candidates: string[] = [];
  for (let d = monthStart; d.isBefore(today, 'day'); d = d.add(1, 'day')) {
    const s = d.format(ISO);
    if (isWorkday(s, shiftOf(an)) && s !== missing) candidates.push(s);
  }
  const anLeaveDay = candidates.length ? candidates[Math.floor(candidates.length / 2)] : nextWorkday(today.subtract(10, 'day'), 'E005');
  const nextMonday = today.add(((8 - today.day()) % 7) || 7, 'day');
  const hungFrom = nextWorkday(nextMonday, 'E010');
  const hungTo = nextWorkday(nextMonday, 'E010', 3);
  const yesterday = today.subtract(1, 'day').format(ISO);

  const leaves: LeaveRequest[] = [
    leave('L0001', 'E005', 'annual', anLeaveDay, anLeaveDay, 'Giải quyết việc gia đình', 12, [['E004', 'approve', 'Đồng ý', 11]]),
    leave('L0002', 'E006', 'sick', today.format(ISO), today.format(ISO), 'Sốt cao, có giấy khám của bệnh viện', 0, []),
    leave('L0003', 'E010', 'annual', hungFrom, hungTo, 'Về quê tổ chức đám cưới', 2, [['E009', 'approve', 'Đã bố trí người thay ca giám sát', 1]]),
    leave('L0004', 'E015', 'overtime', yesterday, yesterday, 'Hoàn thiện số liệu công tháng trước', 1, [['E002', 'approve', undefined, 0]], { hours: 3 }),
  ];

  const proposals: Proposal[] = [
    proposal('R0001', `VT-${year}-0037`, 'VAT_TU', 'E004', {
      projectId: 'P01',
      needDate: today.add(5, 'day').format(ISO),
      items: [
        { name: 'Thép D16 CB400-V', unit: 'tấn', qty: 12, price: 18_500_000 },
        { name: 'Xi măng PCB40', unit: 'tấn', qty: 40, price: 1_600_000 },
      ],
      note: 'Phục vụ đổ bê tông sàn tầng 3, block B',
    }, 1, [['E012', 'approve', 'Khối lượng khớp dự toán', 0]]),
    proposal('R0002', `TU-${year}-0112`, 'TAM_UNG', 'E005', {
      projectId: 'P01',
      amount: 8_000_000,
      purpose: 'Tạm ứng mua vật tư phụ và chi phí nghiệm thu móng block B',
      needDate: today.add(2, 'day').format(ISO),
      method: 'Chuyển khoản',
    }, 0, []),
    proposal('R0003', `TU-${year}-0108`, 'TAM_UNG', 'E013', {
      amount: 65_000_000,
      purpose: 'Tạm ứng chi phí khảo sát địa chất dự án mới',
      needDate: today.subtract(3, 'day').format(ISO),
      method: 'Chuyển khoản',
    }, 6, [['E012', 'approve', undefined, 6], ['E003', 'approve', undefined, 5], ['E001', 'approve', 'Đồng ý', 5]]),
    proposal('R0004', `TT-${year}-0021`, 'THANH_TOAN', 'E009', {
      projectId: 'P02',
      vendor: 'Công ty Cơ điện Minh Phát (mẫu)',
      contractNo: 'HĐTP-2026/014',
      stage: 'Đợt 3 — lắp đặt hệ thống điện tầng 1–6',
      amount: 420_000_000,
      note: 'Đính kèm biên bản nghiệm thu khối lượng đợt 3',
    }, 2, [['E012', 'approve', 'Đã kiểm tra khối lượng', 1]]),
    proposal('R0005', `TU-${year}-0105`, 'TAM_UNG', 'E008', {
      projectId: 'P01',
      amount: 15_000_000,
      purpose: 'Tạm ứng mua dụng cụ cầm tay cho tổ cốp pha',
      needDate: today.subtract(4, 'day').format(ISO),
      method: 'Tiền mặt',
    }, 8, [['E004', 'reject', 'Đề nghị bổ sung báo giá của 2 nhà cung cấp', 7]]),
  ];

  return { leaves, proposals, seq: 100 };
}
