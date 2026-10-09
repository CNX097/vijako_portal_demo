import { Tag } from 'antd';
import type { WorkflowInstance } from '../lib/workflow';

const MAP: Record<WorkflowInstance['status'], [string, string]> = {
  pending: ['processing', 'Chờ duyệt'],
  approved: ['success', 'Đã duyệt'],
  rejected: ['error', 'Từ chối'],
};

export function WorkflowStatusTag({ status }: { status: WorkflowInstance['status'] }) {
  const [color, label] = MAP[status];
  return <Tag color={color} style={{ marginInlineEnd: 0 }}>{label}</Tag>;
}
