import { useMemo } from 'react';
import { useDemoStore } from './useDemoStore';
import { currentApprover } from '../lib/workflow';

/** Đơn từ & đề xuất đang chờ người dùng hiện tại duyệt */
export function usePendingForMe() {
  const me = useDemoStore((s) => s.currentUserId);
  const leaves = useDemoStore((s) => s.leaves);
  const proposals = useDemoStore((s) => s.proposals);
  return useMemo(
    () => ({
      leaves: leaves.filter((l) => currentApprover(l.workflow) === me),
      proposals: proposals.filter((p) => currentApprover(p.workflow) === me),
    }),
    [me, leaves, proposals],
  );
}
