/**
 * Workflow engine thu nhỏ — mô phỏng động cơ phê duyệt dùng chung trong kế hoạch
 * (docs/03-kien-truc-ky-thuat.md, mục 5). Luồng duyệt được khai báo bằng cấu hình,
 * người duyệt được xác định từ cơ cấu tổ chức / dự án tại thời điểm gửi.
 */

export type ApproverRule =
  | { type: 'manager'; level?: number }
  | { type: 'position'; code: string }
  | { type: 'project_manager' };

export interface WorkflowContext {
  requesterId: string;
  amount?: number;
  days?: number;
  projectId?: string;
}

export interface StepDef {
  id: string;
  name: string;
  approver: ApproverRule;
  when?: (ctx: WorkflowContext) => boolean;
  /** mô tả điều kiện, hiển thị cho người dùng */
  whenLabel?: string;
}

export interface WorkflowDef {
  code: string;
  name: string;
  slaHours: number;
  steps: StepDef[];
}

export type StepStatus = 'waiting' | 'pending' | 'approved' | 'rejected' | 'skipped';

export interface StepInstance {
  id: string;
  name: string;
  approverId?: string;
  status: StepStatus;
  note?: string;
  comment?: string;
  actedAt?: string;
}

export interface HistoryEntry {
  at: string;
  actorId: string;
  action: 'submit' | 'approve' | 'reject';
  stepName?: string;
  comment?: string;
}

export interface WorkflowInstance {
  code: string;
  status: 'pending' | 'approved' | 'rejected';
  steps: StepInstance[];
  history: HistoryEntry[];
}

export interface OrgLookup {
  managerOf(employeeId: string): string | undefined;
  holderOf(positionCode: string): string | undefined;
  projectManagerOf(projectId: string): string | undefined;
}

function resolveApprover(rule: ApproverRule, ctx: WorkflowContext, org: OrgLookup): string | undefined {
  switch (rule.type) {
    case 'manager': {
      let id: string | undefined = ctx.requesterId;
      for (let i = 0; i < (rule.level ?? 1) && id; i++) id = org.managerOf(id);
      return id;
    }
    case 'position':
      return org.holderOf(rule.code);
    case 'project_manager':
      return ctx.projectId ? org.projectManagerOf(ctx.projectId) : undefined;
  }
}

/** Tính trước các bước duyệt (dùng cho cả xem trước luồng duyệt khi đang điền đơn). */
export function planSteps(def: WorkflowDef, ctx: WorkflowContext, org: OrgLookup): StepInstance[] {
  const steps: StepInstance[] = [];
  for (const s of def.steps) {
    const base = { id: s.id, name: s.name };
    if (s.when && !s.when(ctx)) {
      steps.push({ ...base, status: 'skipped', note: `Không áp dụng — chỉ khi ${s.whenLabel ?? 'thoả điều kiện'}` });
      continue;
    }
    const approverId = resolveApprover(s.approver, ctx, org);
    if (!approverId) {
      steps.push({ ...base, status: 'skipped', note: 'Không xác định được người duyệt' });
      continue;
    }
    if (approverId === ctx.requesterId) {
      steps.push({ ...base, approverId, status: 'skipped', note: 'Người đề xuất cũng là người duyệt — tự động bỏ qua' });
      continue;
    }
    const prev = [...steps].reverse().find((x) => x.status !== 'skipped');
    if (prev?.approverId === approverId) {
      steps.push({ ...base, approverId, status: 'skipped', note: 'Trùng người duyệt bước trước — tự động bỏ qua' });
      continue;
    }
    steps.push({ ...base, approverId, status: 'waiting' });
  }
  return steps;
}

export function startWorkflow(def: WorkflowDef, ctx: WorkflowContext, org: OrgLookup, now: string): WorkflowInstance {
  const steps = planSteps(def, ctx, org);
  const first = steps.findIndex((s) => s.status === 'waiting');
  if (first >= 0) steps[first] = { ...steps[first], status: 'pending' };
  return {
    code: def.code,
    status: first >= 0 ? 'pending' : 'approved',
    steps,
    history: [{ at: now, actorId: ctx.requesterId, action: 'submit' }],
  };
}

export function currentStep(wf: WorkflowInstance): StepInstance | undefined {
  return wf.status === 'pending' ? wf.steps.find((s) => s.status === 'pending') : undefined;
}

export function currentApprover(wf: WorkflowInstance): string | undefined {
  return currentStep(wf)?.approverId;
}

export function actOnWorkflow(
  wf: WorkflowInstance,
  actorId: string,
  action: 'approve' | 'reject',
  now: string,
  comment?: string,
): WorkflowInstance {
  const idx = wf.steps.findIndex((s) => s.status === 'pending');
  if (wf.status !== 'pending' || idx < 0) throw new Error('Phiếu không ở trạng thái chờ duyệt');
  if (wf.steps[idx].approverId !== actorId) throw new Error('Bạn không phải người duyệt của bước hiện tại');

  const steps = wf.steps.map((s) => ({ ...s }));
  steps[idx] = { ...steps[idx], status: action === 'approve' ? 'approved' : 'rejected', actedAt: now, comment };
  let status: WorkflowInstance['status'] = 'rejected';
  if (action === 'approve') {
    const next = steps.findIndex((s, i) => i > idx && s.status === 'waiting');
    if (next >= 0) {
      steps[next] = { ...steps[next], status: 'pending' };
      status = 'pending';
    } else {
      status = 'approved';
    }
  }
  return {
    ...wf,
    status,
    steps,
    history: [...wf.history, { at: now, actorId, action, stepName: steps[idx].name, comment }],
  };
}
