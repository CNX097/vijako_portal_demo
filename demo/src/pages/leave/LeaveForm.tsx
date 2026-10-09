import { useEffect, useMemo } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Alert, App, DatePicker, Form, Input, InputNumber, Modal, Select, Tag, TimePicker } from 'antd';
import type { LeaveRequest, LeaveType } from '../../types';
import { LEAVE_TYPES } from '../../data/workflows';
import { ORG, getEmployee, shiftOf } from '../../data/org';
import { planSteps } from '../../lib/workflow';
import { countWorkdays, datesInRange } from '../../lib/calendar';
import { dayCell } from '../../lib/attendance';
import { DATE_FMT, ISO, fmtDate } from '../../lib/format';
import { leaveBalance } from '../../lib/leave';
import { useCurrentUser, useDemoStore } from '../../store/useDemoStore';

interface Values {
  type: LeaveType;
  range?: [Dayjs, Dayjs];
  date?: Dayjs;
  hours?: number;
  time?: Dayjs;
  reason?: string;
}

export function LeaveForm({ open, initialType, onClose, onCreated }: { open: boolean; initialType?: LeaveType; onClose: () => void; onCreated: (l: LeaveRequest) => void }) {
  const [form] = Form.useForm<Values>();
  const { message } = App.useApp();
  const me = useCurrentUser();
  const leaves = useDemoStore((s) => s.leaves);
  const attendance = useDemoStore((s) => s.attendance);
  const createLeave = useDemoStore((s) => s.createLeave);

  const type = Form.useWatch('type', form) ?? 'annual';
  const range = Form.useWatch('range', form);
  const kind = LEAVE_TYPES[type].kind;
  const days = kind === 'range' && range ? countWorkdays(range[0].format(ISO), range[1].format(ISO), shiftOf(me)) : 0;
  const bal = leaveBalance(me, leaves);

  // Ngày thiếu dữ liệu chấm công trong tháng — gợi ý cho đơn giải trình
  const missingDates = useMemo(() => {
    const todayStr = dayjs().format(ISO);
    return datesInRange(dayjs().startOf('month').subtract(1, 'month').format(ISO), dayjs().subtract(1, 'day').format(ISO))
      .filter((d) => dayCell(me, d, leaves, attendance, todayStr).tone === 'missing')
      .filter((d) => !leaves.some((l) => l.employeeId === me.id && l.type === 'missing_checkin' && l.from === d && l.workflow.status !== 'rejected'));
  }, [me, leaves, attendance]);

  useEffect(() => {
    if (!open) return;
    form.resetFields();
    const t = initialType ?? 'annual';
    form.setFieldsValue({
      type: t,
      date: t === 'missing_checkin' && missingDates[0] ? dayjs(missingDates[0]) : undefined,
      time: t === 'missing_checkin' ? dayjs(`2000-01-01T${shiftOf(me).end}`) : undefined,
    });
  }, [open]);

  const preview = planSteps(LEAVE_TYPES[type].workflow, { requesterId: me.id, days }, ORG);

  const submit = async () => {
    const v = await form.validateFields();
    const from = kind === 'range' ? v.range![0].format(ISO) : v.date!.format(ISO);
    const to = kind === 'range' ? v.range![1].format(ISO) : from;
    if (kind === 'range' && days === 0) {
      message.warning('Khoảng thời gian không có ngày làm việc nào theo ca của bạn');
      return;
    }
    const req = createLeave({
      type: v.type,
      from,
      to,
      hours: kind === 'overtime' ? v.hours : undefined,
      time: kind === 'adjust' ? v.time?.format('HH:mm') : undefined,
      reason: v.reason ?? '',
    });
    message.success('Đã gửi đơn — người duyệt nhận thông báo ngay');
    onCreated(req);
  };

  return (
    <Modal open={open} title="Tạo đơn" okText="Gửi đơn" cancelText="Huỷ" onOk={submit} onCancel={onClose} destroyOnHidden width={620}>
      <Form form={form} layout="vertical" requiredMark="optional" initialValues={{ type: 'annual' }}>
        <Form.Item name="type" label="Loại đơn" rules={[{ required: true }]}>
          <Select options={Object.entries(LEAVE_TYPES).map(([k, t]) => ({ value: k, label: t.label }))} />
        </Form.Item>

        {kind === 'range' && (
          <>
            <Form.Item name="range" label="Thời gian" rules={[{ required: true, message: 'Chọn ngày bắt đầu và kết thúc' }]}>
              <DatePicker.RangePicker format={DATE_FMT} style={{ width: '100%' }} />
            </Form.Item>
            {range && (
              <Alert
                style={{ marginBottom: 16 }}
                type={type === 'annual' && days > bal.remaining ? 'warning' : 'info'}
                showIcon
                message={
                  <>
                    <b>{days}</b> ngày làm việc theo {shiftOf(me).name.toLowerCase()}
                    {type === 'annual' && <> · phép năm còn <b>{bal.remaining}</b> ngày{days > bal.remaining && ' — vượt quỹ phép, phần vượt tính nghỉ không lương'}</>}
                  </>
                }
              />
            )}
          </>
        )}

        {kind === 'overtime' && (
          <div style={{ display: 'flex', gap: 12 }}>
            <Form.Item name="date" label="Ngày làm thêm" rules={[{ required: true }]} style={{ flex: 1 }}>
              <DatePicker format={DATE_FMT} style={{ width: '100%' }} />
            </Form.Item>
            <Form.Item name="hours" label="Số giờ" rules={[{ required: true }]} style={{ width: 140 }}>
              <InputNumber min={0.5} max={12} step={0.5} style={{ width: '100%' }} />
            </Form.Item>
          </div>
        )}

        {kind === 'adjust' && (
          <>
            {missingDates.length > 0 && (
              <div style={{ marginBottom: 12 }}>
                <span className="muted">Ngày thiếu dữ liệu chấm công của bạn: </span>
                {missingDates.map((d) => (
                  <Tag key={d} color="red" style={{ cursor: 'pointer' }} onClick={() => form.setFieldValue('date', dayjs(d))}>
                    {fmtDate(d)}
                  </Tag>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 12 }}>
              <Form.Item
                name="date"
                label="Ngày cần giải trình"
                rules={[{ required: true }]}
                style={{ flex: 1 }}
              >
                <DatePicker format={DATE_FMT} style={{ width: '100%' }} disabledDate={(d) => d.isAfter(dayjs(), 'day')} />
              </Form.Item>
              <Form.Item name="time" label="Giờ ra thực tế" rules={[{ required: true }]} style={{ width: 160 }}>
                <TimePicker format="HH:mm" minuteStep={5} style={{ width: '100%' }} />
              </Form.Item>
            </div>
          </>
        )}

        <Form.Item name="reason" label="Lý do" rules={[{ required: true, message: 'Nhập lý do' }]}>
          <Input.TextArea rows={3} placeholder="VD: Việc gia đình / quên chấm công ra do họp giao ban cuối ngày tại công trường…" />
        </Form.Item>

        <div style={{ background: '#f8fafc', border: '1px solid var(--border)', borderRadius: 10, padding: 12 }}>
          <div style={{ fontWeight: 600, marginBottom: 6 }}>Luồng duyệt dự kiến</div>
          {preview.map((s, i) => (
            <div key={s.id} style={{ display: 'flex', gap: 8, padding: '3px 0', opacity: s.status === 'skipped' ? 0.5 : 1 }}>
              <span className="muted">{i + 1}.</span>
              <span>
                <b>{s.name}</b>
                {s.approverId && <> — {getEmployee(s.approverId).name}</>}
                {s.note && <div className="muted" style={{ fontSize: 12 }}>{s.note}</div>}
              </span>
            </div>
          ))}
        </div>
      </Form>
    </Modal>
  );
}
