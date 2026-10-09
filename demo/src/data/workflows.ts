import type { WorkflowDef } from '../lib/workflow';
import type { LeaveType } from '../types';

const M = 1_000_000;

export const WF_LEAVE: WorkflowDef = {
  code: 'DON_NGHI',
  name: 'Đơn nghỉ / công tác',
  slaHours: 24,
  steps: [
    { id: 'mgr', name: 'Quản lý trực tiếp', approver: { type: 'manager', level: 1 } },
    {
      id: 'hr',
      name: 'Trưởng phòng HCNS',
      approver: { type: 'position', code: 'TP_HCNS' },
      when: (c) => (c.days ?? 0) > 3,
      whenLabel: 'nghỉ / công tác trên 3 ngày',
    },
  ],
};

export const WF_ADJUST: WorkflowDef = {
  code: 'GIAI_TRINH',
  name: 'Làm thêm giờ / giải trình công',
  slaHours: 24,
  steps: [{ id: 'mgr', name: 'Quản lý trực tiếp', approver: { type: 'manager', level: 1 } }],
};

export const LEAVE_TYPES: Record<LeaveType, { label: string; short: string; color: string; workflow: WorkflowDef; kind: 'range' | 'overtime' | 'adjust' }> = {
  annual: { label: 'Nghỉ phép năm', short: 'P', color: 'blue', workflow: WF_LEAVE, kind: 'range' },
  sick: { label: 'Nghỉ ốm', short: 'Ô', color: 'cyan', workflow: WF_LEAVE, kind: 'range' },
  unpaid: { label: 'Nghỉ không lương', short: 'KL', color: 'default', workflow: WF_LEAVE, kind: 'range' },
  business_trip: { label: 'Công tác', short: 'CT', color: 'purple', workflow: WF_LEAVE, kind: 'range' },
  overtime: { label: 'Làm thêm giờ', short: 'OT', color: 'gold', workflow: WF_ADJUST, kind: 'overtime' },
  missing_checkin: { label: 'Quên chấm công / giải trình', short: 'GT', color: 'orange', workflow: WF_ADJUST, kind: 'adjust' },
};

export type FieldDef =
  | { name: string; label: string; kind: 'text' | 'textarea'; required?: boolean; placeholder?: string }
  | { name: string; label: string; kind: 'money'; required?: boolean }
  | { name: string; label: string; kind: 'date'; required?: boolean }
  | { name: string; label: string; kind: 'project'; required?: boolean }
  | { name: string; label: string; kind: 'select'; options: string[]; required?: boolean }
  | { name: string; label: string; kind: 'items' };

export interface MaterialItem {
  name?: string;
  unit?: string;
  qty?: number;
  price?: number;
}

export interface ProcessTemplate {
  code: string;
  prefix: string;
  name: string;
  description: string;
  color: string;
  workflow: WorkflowDef;
  fields: FieldDef[];
  amountOf: (data: Record<string, unknown>) => number;
  titleOf: (data: Record<string, unknown>) => string;
}

export const itemsTotal = (items: unknown): number =>
  Array.isArray(items) ? (items as MaterialItem[]).reduce((s, it) => s + (it?.qty ?? 0) * (it?.price ?? 0), 0) : 0;

export const PROCESS_TEMPLATES: ProcessTemplate[] = [
  {
    code: 'TAM_UNG',
    prefix: 'TU',
    name: 'Đề nghị tạm ứng',
    description: 'Tạm ứng chi phí công tác, mua sắm nhỏ, chi phí công trường',
    color: '#d97706',
    workflow: {
      code: 'TAM_UNG',
      name: 'Đề nghị tạm ứng',
      slaHours: 24,
      steps: [
        { id: 'mgr', name: 'Quản lý trực tiếp', approver: { type: 'manager', level: 1 } },
        { id: 'cht', name: 'Chỉ huy trưởng công trường', approver: { type: 'project_manager' }, when: (c) => !!c.projectId, whenLabel: 'đề nghị gắn với công trình' },
        { id: 'ktt', name: 'Kế toán trưởng', approver: { type: 'position', code: 'KTT' } },
        { id: 'tgd', name: 'Tổng Giám đốc', approver: { type: 'position', code: 'TGD' }, when: (c) => (c.amount ?? 0) > 50 * M, whenLabel: 'số tiền trên 50.000.000 ₫' },
      ],
    },
    fields: [
      { name: 'projectId', label: 'Công trình (nếu có)', kind: 'project' },
      { name: 'amount', label: 'Số tiền tạm ứng', kind: 'money', required: true },
      { name: 'purpose', label: 'Mục đích', kind: 'textarea', required: true, placeholder: 'VD: Tạm ứng mua vật tư phụ, chi phí nghiệm thu…' },
      { name: 'needDate', label: 'Ngày cần nhận tiền', kind: 'date', required: true },
      { name: 'method', label: 'Hình thức nhận', kind: 'select', options: ['Chuyển khoản', 'Tiền mặt'], required: true },
    ],
    amountOf: (d) => Number(d.amount ?? 0),
    titleOf: (d) => String(d.purpose ?? 'Đề nghị tạm ứng'),
  },
  {
    code: 'VAT_TU',
    prefix: 'VT',
    name: 'Đề xuất vật tư',
    description: 'Đề xuất cấp / mua vật tư cho công trình, có bảng chi tiết',
    color: '#2563eb',
    workflow: {
      code: 'VAT_TU',
      name: 'Đề xuất vật tư',
      slaHours: 24,
      steps: [
        { id: 'cht', name: 'Chỉ huy trưởng công trường', approver: { type: 'project_manager' } },
        { id: 'tpkt', name: 'Trưởng phòng Kỹ thuật', approver: { type: 'position', code: 'TP_KT' } },
        { id: 'tgd', name: 'Tổng Giám đốc', approver: { type: 'position', code: 'TGD' }, when: (c) => (c.amount ?? 0) > 100 * M, whenLabel: 'tổng giá trị trên 100.000.000 ₫' },
      ],
    },
    fields: [
      { name: 'projectId', label: 'Công trình', kind: 'project', required: true },
      { name: 'needDate', label: 'Ngày cần vật tư', kind: 'date', required: true },
      { name: 'items', label: 'Danh mục vật tư', kind: 'items' },
      { name: 'note', label: 'Ghi chú', kind: 'textarea' },
    ],
    amountOf: (d) => itemsTotal(d.items),
    titleOf: (d) => {
      const items = (Array.isArray(d.items) ? d.items : []) as MaterialItem[];
      const names = items.map((i) => i?.name).filter(Boolean);
      return names.length ? `Vật tư: ${names.slice(0, 2).join(', ')}${names.length > 2 ? '…' : ''}` : 'Đề xuất vật tư';
    },
  },
  {
    code: 'THANH_TOAN',
    prefix: 'TT',
    name: 'Đề nghị thanh toán thầu phụ',
    description: 'Thanh toán theo đợt cho nhà thầu phụ / nhà cung cấp',
    color: '#7c3aed',
    workflow: {
      code: 'THANH_TOAN',
      name: 'Đề nghị thanh toán thầu phụ',
      slaHours: 48,
      steps: [
        { id: 'cht', name: 'Chỉ huy trưởng (xác nhận khối lượng)', approver: { type: 'project_manager' } },
        { id: 'tpkt', name: 'Trưởng phòng Kỹ thuật', approver: { type: 'position', code: 'TP_KT' } },
        { id: 'ktt', name: 'Kế toán trưởng', approver: { type: 'position', code: 'KTT' } },
        { id: 'tgd', name: 'Tổng Giám đốc', approver: { type: 'position', code: 'TGD' } },
      ],
    },
    fields: [
      { name: 'projectId', label: 'Công trình', kind: 'project', required: true },
      { name: 'vendor', label: 'Nhà thầu phụ / nhà cung cấp', kind: 'text', required: true },
      { name: 'contractNo', label: 'Số hợp đồng', kind: 'text', required: true },
      { name: 'stage', label: 'Đợt thanh toán', kind: 'text', required: true, placeholder: 'VD: Đợt 3 — hoàn thành phần thô tầng 5–8' },
      { name: 'amount', label: 'Giá trị đề nghị thanh toán', kind: 'money', required: true },
      { name: 'note', label: 'Ghi chú', kind: 'textarea' },
    ],
    amountOf: (d) => Number(d.amount ?? 0),
    titleOf: (d) => `${d.vendor ?? 'Thầu phụ'} — ${d.stage ?? ''}`.trim(),
  },
];

export const getTemplate = (code: string) => PROCESS_TEMPLATES.find((t) => t.code === code)!;
