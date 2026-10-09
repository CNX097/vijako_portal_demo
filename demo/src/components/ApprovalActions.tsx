import { useState } from 'react';
import { Alert, App, Button, Input, Space } from 'antd';
import { CheckOutlined, CloseOutlined, SwapOutlined } from '@ant-design/icons';
import { currentApprover, type WorkflowInstance } from '../lib/workflow';
import { getEmployee } from '../data/org';
import { useDemoStore } from '../store/useDemoStore';

/** Nút duyệt / từ chối cho người duyệt hiện tại; người khác thấy đang chờ ai và có thể đổi vai trò để thử. */
export function ApprovalActions({ wf, onAct }: { wf: WorkflowInstance; onAct: (action: 'approve' | 'reject', comment?: string) => void }) {
  const { message } = App.useApp();
  const me = useDemoStore((s) => s.currentUserId);
  const setCurrentUser = useDemoStore((s) => s.setCurrentUser);
  const [comment, setComment] = useState('');
  const approver = currentApprover(wf);

  if (!approver) return null;

  if (approver !== me) {
    const e = getEmployee(approver);
    return (
      <Alert
        type="info"
        showIcon
        message={`Đang chờ ${e.name} duyệt`}
        description="Trong demo, bạn có thể đổi sang vai trò người duyệt để thử thao tác duyệt."
        action={
          <Button size="small" icon={<SwapOutlined />} onClick={() => { setCurrentUser(approver); message.info(`Đã chuyển sang vai trò ${e.name}`); }}>
            Xem với vai trò này
          </Button>
        }
      />
    );
  }

  const act = (action: 'approve' | 'reject') => {
    if (action === 'reject' && !comment.trim()) {
      message.warning('Vui lòng nhập lý do từ chối');
      return;
    }
    onAct(action, comment.trim() || undefined);
    setComment('');
    message.success(action === 'approve' ? 'Đã duyệt' : 'Đã từ chối');
  };

  return (
    <div style={{ padding: 12, border: '1px solid #fde68a', background: '#fffbeb', borderRadius: 10 }}>
      <div style={{ fontWeight: 600, marginBottom: 8 }}>Bạn là người duyệt bước này</div>
      <Input.TextArea rows={2} placeholder="Ý kiến (bắt buộc khi từ chối)" value={comment} onChange={(e) => setComment(e.target.value)} />
      <Space style={{ marginTop: 10 }}>
        <Button type="primary" icon={<CheckOutlined />} onClick={() => act('approve')}>Duyệt</Button>
        <Button danger icon={<CloseOutlined />} onClick={() => act('reject')}>Từ chối</Button>
      </Space>
    </div>
  );
}
