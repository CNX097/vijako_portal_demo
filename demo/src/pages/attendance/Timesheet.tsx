import { useState } from 'react';
import dayjs, { type Dayjs } from 'dayjs';
import { Alert, App, Button, Card, DatePicker, Popconfirm, Select, Space, Tag, Tooltip } from 'antd';
import { DownloadOutlined, LockOutlined } from '@ant-design/icons';
import { DEPARTMENTS, getDepartment, shiftOf } from '../../data/org';
import { dayCell, summarize, type DayCell } from '../../lib/attendance';
import { isWorkday } from '../../lib/calendar';
import { ISO, fmtDate } from '../../lib/format';
import { canLockTimesheet, managedEmployees } from '../../lib/permissions';
import { useCurrentUser, useDemoStore } from '../../store/useDemoStore';

const METHOD: Record<string, string> = { gps: 'App GPS', device: 'Máy chấm công', proxy: 'Chấm hộ' };

function cellTip(c: DayCell) {
  return (
    <div style={{ fontSize: 12 }}>
      <div style={{ fontWeight: 600 }}>{fmtDate(c.date)}</div>
      {c.checkIn && <div>Vào {c.checkIn} · Ra {c.checkOut ?? '—'}</div>}
      {c.method && <div>{METHOD[c.method]}{c.distanceM != null ? ` · cách tâm ${c.distanceM} m` : ''}</div>}
      {c.note && <div>{c.note}</div>}
    </div>
  );
}

export function Timesheet() {
  const me = useCurrentUser();
  const { message } = App.useApp();
  const leaves = useDemoStore((s) => s.leaves);
  const attendance = useDemoStore((s) => s.attendance);
  const lockedMonths = useDemoStore((s) => s.lockedMonths);
  const lockMonth = useDemoStore((s) => s.lockMonth);
  const [month, setMonth] = useState<Dayjs>(dayjs().startOf('month'));
  const [dept, setDept] = useState<string>();

  const scope = managedEmployees(me);
  const deptOptions = DEPARTMENTS.filter((d) => scope.some((e) => e.departmentId === d.id));
  const people = scope.filter((e) => !dept || e.departmentId === dept);
  const monthKey = month.format('YYYY-MM');
  const locked = lockedMonths.includes(monthKey);
  const todayStr = dayjs().format(ISO);
  const days = Array.from({ length: month.daysInMonth() }, (_, i) => month.date(i + 1).format(ISO));

  const grid = people.map((e) => ({ e, cells: days.map((d) => dayCell(e, d, leaves, attendance, todayStr)) }));
  const missingTotal = grid.reduce((s, r) => s + summarize(r.cells).missing, 0);

  const exportCsv = () => {
    const header = ['Mã NV', 'Họ tên', 'Phòng ban', ...days.map((d) => dayjs(d).format('DD')), 'Công', 'Muộn', 'Nghỉ', 'Thiếu'];
    const lines = grid.map(({ e, cells }) => {
      const s = summarize(cells);
      return [e.code, e.name, getDepartment(e.departmentId).name, ...cells.map((c) => c.code), s.work, s.late, s.leave, s.missing];
    });
    const csv = '﻿' + [header, ...lines].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `bang-cong-${monthKey}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'space-between', marginBottom: 12 }}>
        <Space wrap>
          <DatePicker picker="month" format="MM/YYYY" value={month} allowClear={false} onChange={(v) => v && setMonth(v.startOf('month'))} />
          {deptOptions.length > 1 && (
            <Select allowClear placeholder="Tất cả phòng ban / BCH" style={{ width: 250 }} value={dept} onChange={setDept} options={deptOptions.map((d) => ({ value: d.id, label: d.name }))} />
          )}
          {locked && <Tag icon={<LockOutlined />} color="green">Đã chốt công — đã chuyển sang Bảng lương</Tag>}
        </Space>
        <Space wrap>
          <Button icon={<DownloadOutlined />} onClick={exportCsv}>Xuất Excel</Button>
          {canLockTimesheet(me) && !locked && (
            <Popconfirm
              title={`Chốt công tháng ${month.format('MM/YYYY')}?`}
              description={missingTotal ? `Còn ${missingTotal} ô thiếu dữ liệu chưa giải trình.` : 'Sau khi chốt, dữ liệu công chuyển sang tính lương.'}
              okText="Chốt công"
              cancelText="Huỷ"
              onConfirm={() => {
                lockMonth(monthKey);
                message.success(`Đã chốt công tháng ${month.format('MM/YYYY')}`);
              }}
            >
              <Button type="primary" icon={<LockOutlined />}>Chốt công</Button>
            </Popconfirm>
          )}
        </Space>
      </div>

      {people.length === 1 && (
        <Alert type="info" showIcon style={{ marginBottom: 12 }} message="Bạn đang xem bảng công của chính mình. Chỉ huy trưởng / trưởng phòng xem được bảng công của cấp dưới; HCNS và Ban Giám đốc xem toàn công ty." />
      )}

      <div className="ts-wrap">
        <table className="ts">
          <thead>
            <tr>
              <th className="name-col">Nhân viên</th>
              {days.map((d) => {
                const dd = dayjs(d);
                const weekend = !isWorkday(d, shiftOf(people[0] ?? me));
                return (
                  <th key={d} className={`day${weekend ? ' weekend' : ''}${d === todayStr ? ' today' : ''}`}>
                    <div>{dd.format('DD')}</div>
                    <div className="muted" style={{ fontWeight: 400, fontSize: 10 }}>{dd.format('dd')}</div>
                  </th>
                );
              })}
              <th className="sum">Công</th>
              <th className="sum">Muộn</th>
              <th className="sum">Nghỉ</th>
              <th className="sum">Thiếu</th>
            </tr>
          </thead>
          <tbody>
            {grid.map(({ e, cells }) => {
              const s = summarize(cells);
              return (
                <tr key={e.id}>
                  <td className="name-col">
                    <div style={{ fontWeight: 600 }}>{e.name}</div>
                    <div className="muted" style={{ fontSize: 11 }}>{getDepartment(e.departmentId).name}</div>
                  </td>
                  {cells.map((c) => (
                    <td key={c.date} className={`${c.tone === 'off' ? 'weekend' : ''}${c.date === todayStr ? ' today' : ''}`}>
                      {c.code ? (
                        <Tooltip title={cellTip(c)} mouseEnterDelay={0.2}>
                          <span className={`cell cell-${c.tone}`}>{c.code}</span>
                        </Tooltip>
                      ) : null}
                    </td>
                  ))}
                  <td className="sum">{s.work}</td>
                  <td className="sum" style={{ color: s.late ? '#b45309' : undefined }}>{s.late}</td>
                  <td className="sum" style={{ color: s.leave ? '#1d4ed8' : undefined }}>{s.leave}</td>
                  <td className="sum" style={{ color: s.missing ? '#b91c1c' : undefined }}>{s.missing}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="legend" style={{ marginTop: 12 }}>
        <span><span className="cell cell-ok">X</span> Đủ công</span>
        <span><span className="cell cell-late">M</span> Đi muộn</span>
        <span><span className="cell cell-leave">P</span> Nghỉ phép · Ô ốm · CT công tác · KL không lương</span>
        <span><span className="cell cell-missing">?</span> Thiếu dữ liệu — cần giải trình</span>
        <span><span className="cell cell-holiday">L</span> Ngày lễ</span>
      </div>
    </Card>
  );
}
