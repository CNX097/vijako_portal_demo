import { Timeline, Typography } from 'antd';
import { CheckCircleFilled, ClockCircleFilled, CloseCircleFilled, MinusCircleOutlined, SendOutlined } from '@ant-design/icons';
import type { WorkflowInstance } from '../lib/workflow';
import { POSITIONS, getEmployee } from '../data/org';
import { fmtDateTime } from '../lib/format';

const who = (id?: string) => (id ? `${getEmployee(id).name} · ${POSITIONS[getEmployee(id).positionCode]}` : '—');

/** Hiển thị luồng duyệt: các bước, người duyệt, trạng thái, ý kiến */
export function ApprovalFlow({ wf, requesterId, createdAt, slaHours, submitLabel = 'Gửi đề xuất' }: { wf: WorkflowInstance; requesterId: string; createdAt?: string; slaHours?: number; submitLabel?: string }) {
  const items = [
    {
      color: 'blue',
      dot: <SendOutlined />,
      children: (
        <div>
          <b>{submitLabel}</b>
          <div className="muted">{who(requesterId)}</div>
          {createdAt && <div className="muted" style={{ fontSize: 12 }}>{fmtDateTime(createdAt)}</div>}
        </div>
      ),
    },
    ...wf.steps.map((s) => {
      const dot =
        s.status === 'approved' ? <CheckCircleFilled style={{ color: '#16a34a' }} />
        : s.status === 'rejected' ? <CloseCircleFilled style={{ color: '#dc2626' }} />
        : s.status === 'pending' && wf.status === 'pending' ? <ClockCircleFilled style={{ color: '#d97706' }} />
        : <MinusCircleOutlined style={{ color: '#9ca3af' }} />;
      const statusText =
        s.status === 'approved' ? 'Đã duyệt'
        : s.status === 'rejected' ? 'Từ chối'
        : s.status === 'pending' ? `Đang chờ duyệt${slaHours ? ` · hạn xử lý ${slaHours} giờ` : ''}`
        : s.status === 'skipped' ? 'Bỏ qua'
        : wf.status === 'rejected' ? 'Không thực hiện' : 'Chờ bước trước';
      return {
        dot,
        children: (
          <div style={{ opacity: s.status === 'skipped' || (s.status === 'waiting' && wf.status === 'rejected') ? 0.55 : 1 }}>
            <b>{s.name}</b> <span className="muted">— {statusText}</span>
            {s.approverId && <div className="muted">{who(s.approverId)}</div>}
            {s.note && <div className="muted" style={{ fontSize: 12, fontStyle: 'italic' }}>{s.note}</div>}
            {s.actedAt && <div className="muted" style={{ fontSize: 12 }}>{fmtDateTime(s.actedAt)}</div>}
            {s.comment && (
              <Typography.Paragraph style={{ margin: '4px 0 0', padding: '6px 10px', background: '#f5f7fb', borderRadius: 8 }}>
                “{s.comment}”
              </Typography.Paragraph>
            )}
          </div>
        ),
      };
    }),
  ];
  return <Timeline items={items} style={{ marginTop: 8 }} />;
}
