import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button, Card, Descriptions, Drawer, Table, Tabs, Tag } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { LeaveRequest, LeaveType } from '../../types';
import { LEAVE_TYPES } from '../../data/workflows';
import { getEmployee } from '../../data/org';
import { currentApprover } from '../../lib/workflow';
import { fmtDate, fmtDateTime } from '../../lib/format';
import { leaveBalance } from '../../lib/leave';
import { seesAllRequests } from '../../lib/permissions';
import { ApprovalActions } from '../../components/ApprovalActions';
import { ApprovalFlow } from '../../components/ApprovalFlow';
import { PersonLine } from '../../components/Person';
import { WorkflowStatusTag } from '../../components/WorkflowStatusTag';
import { usePendingForMe } from '../../store/selectors';
import { useCurrentUser, useDemoStore } from '../../store/useDemoStore';
import { LeaveForm } from './LeaveForm';

function when(l: LeaveRequest) {
  const k = LEAVE_TYPES[l.type].kind;
  if (k === 'overtime') return `${fmtDate(l.from)} · ${l.hours} giờ`;
  if (k === 'adjust') return `${fmtDate(l.from)} · giờ ra ${l.time}`;
  return l.from === l.to ? fmtDate(l.from) : `${fmtDate(l.from)} – ${fmtDate(l.to)}`;
}

export function LeavePage() {
  const me = useCurrentUser();
  const leaves = useDemoStore((s) => s.leaves);
  const actLeave = useDemoStore((s) => s.actLeave);
  const pending = usePendingForMe();
  const [params, setParams] = useSearchParams();
  const openId = params.get('open');
  const newParam = params.get('new');
  const [tab, setTab] = useState<string>();
  const bal = leaveBalance(me, leaves);

  const mine = useMemo(() => leaves.filter((l) => l.employeeId === me.id), [leaves, me.id]);
  const selected = leaves.find((l) => l.id === openId);

  const setParam = (k: string, v?: string) => {
    const next = new URLSearchParams(params);
    if (v) next.set(k, v);
    else next.delete(k);
    setParams(next, { replace: true });
  };

  const columns = (withPerson: boolean) => [
    ...(withPerson ? [{ title: 'Người gửi', key: 'p', width: 230, render: (_: unknown, l: LeaveRequest) => <PersonLine id={l.employeeId} size={28} /> }] : []),
    { title: 'Loại đơn', key: 't', width: 190, render: (_: unknown, l: LeaveRequest) => <Tag color={LEAVE_TYPES[l.type].color}>{LEAVE_TYPES[l.type].label}</Tag> },
    { title: 'Thời gian', key: 'w', width: 210, render: (_: unknown, l: LeaveRequest) => when(l) },
    { title: 'Số ngày', dataIndex: 'days', width: 80, render: (d: number) => d || '—' },
    { title: 'Lý do', dataIndex: 'reason', ellipsis: true },
    { title: 'Trạng thái', key: 's', width: 110, render: (_: unknown, l: LeaveRequest) => <WorkflowStatusTag status={l.workflow.status} /> },
    {
      title: 'Đang chờ',
      key: 'a',
      width: 160,
      render: (_: unknown, l: LeaveRequest) => {
        const a = currentApprover(l.workflow);
        return a ? getEmployee(a).name : '—';
      },
    },
  ];

  const table = (rows: LeaveRequest[], withPerson: boolean) => (
    <Table<LeaveRequest>
      rowKey="id"
      dataSource={rows}
      columns={columns(withPerson)}
      pagination={false}
      scroll={{ x: withPerson ? 1100 : 860 }}
      locale={{ emptyText: 'Chưa có đơn' }}
      onRow={(l) => ({ onClick: () => setParam('open', l.id), style: { cursor: 'pointer' } })}
    />
  );

  const tabs = [
    { key: 'mine', label: `Đơn của tôi (${mine.length})`, children: table(mine, false) },
    { key: 'approve', label: `Cần tôi duyệt (${pending.leaves.length})`, children: table(pending.leaves, true) },
    ...(seesAllRequests(me) ? [{ key: 'all', label: `Tất cả đơn (${leaves.length})`, children: table(leaves, true) }] : []),
  ];

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Đơn từ</h1>
          <div className="sub">Nghỉ phép, công tác, làm thêm giờ, giải trình công — đơn được duyệt tự cập nhật vào bảng công</div>
        </div>
        <Button type="primary" icon={<PlusOutlined />} onClick={() => setParam('new', '1')}>Tạo đơn</Button>
      </div>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat-box"><div className="label">Phép năm được hưởng</div><div className="value">{bal.entitlement}</div></div>
        <div className="stat-box"><div className="label">Đã dùng</div><div className="value">{bal.used}</div></div>
        <div className="stat-box"><div className="label">Đang chờ duyệt</div><div className="value">{bal.pending}</div></div>
        <div className="stat-box"><div className="label">Còn lại</div><div className="value" style={{ color: '#16a34a' }}>{bal.remaining}</div></div>
      </div>

      <Card>
        <Tabs activeKey={tab ?? (pending.leaves.length ? 'approve' : 'mine')} onChange={setTab} items={tabs} />
      </Card>

      <LeaveForm
        open={!!newParam}
        initialType={newParam && newParam in LEAVE_TYPES ? (newParam as LeaveType) : undefined}
        onClose={() => setParam('new')}
        onCreated={(l) => {
          const next = new URLSearchParams(params);
          next.delete('new');
          next.set('open', l.id);
          setParams(next, { replace: true });
          setTab('mine');
        }}
      />

      <Drawer open={!!selected} width={520} onClose={() => setParam('open')} title={selected ? LEAVE_TYPES[selected.type].label : ''} extra={selected && <WorkflowStatusTag status={selected.workflow.status} />}>
        {selected && (
          <>
            <PersonLine id={selected.employeeId} size={40} />
            <Descriptions
              column={1}
              size="small"
              style={{ marginTop: 16 }}
              items={[
                { label: 'Mã đơn', children: selected.id },
                { label: 'Thời gian', children: when(selected) },
                ...(selected.days ? [{ label: 'Số ngày làm việc', children: selected.days }] : []),
                { label: 'Lý do', children: selected.reason },
                { label: 'Gửi lúc', children: fmtDateTime(selected.createdAt) },
              ]}
            />
            <div style={{ margin: '12px 0' }}>
              <ApprovalActions wf={selected.workflow} onAct={(a, c) => actLeave(selected.id, a, c)} />
            </div>
            <div style={{ fontWeight: 600, marginTop: 16 }}>Luồng duyệt</div>
            <ApprovalFlow wf={selected.workflow} requesterId={selected.employeeId} createdAt={selected.createdAt} slaHours={LEAVE_TYPES[selected.type].workflow.slaHours} submitLabel="Gửi đơn" />
          </>
        )}
      </Drawer>
    </>
  );
}
