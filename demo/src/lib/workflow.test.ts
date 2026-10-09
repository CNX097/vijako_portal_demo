import { describe, expect, it } from 'vitest';
import { actOnWorkflow, currentApprover, planSteps, startWorkflow, type OrgLookup, type WorkflowDef } from './workflow';
import { ORG } from '../data/org';
import { WF_LEAVE, getTemplate } from '../data/workflows';

const NOW = '2026-10-09T09:00:00';

const org: OrgLookup = {
  managerOf: (id) => ({ staff: 'lead', lead: 'boss' } as Record<string, string>)[id],
  holderOf: (code) => ({ ACC: 'accountant', CEO: 'boss' } as Record<string, string>)[code],
  projectManagerOf: (p) => (p === 'P1' ? 'lead' : undefined),
};

const def: WorkflowDef = {
  code: 'T',
  name: 'Test',
  slaHours: 24,
  steps: [
    { id: 'mgr', name: 'Manager', approver: { type: 'manager' } },
    { id: 'pm', name: 'Project manager', approver: { type: 'project_manager' }, when: (c) => !!c.projectId, whenLabel: 'có dự án' },
    { id: 'acc', name: 'Accountant', approver: { type: 'position', code: 'ACC' } },
    { id: 'ceo', name: 'CEO', approver: { type: 'position', code: 'CEO' }, when: (c) => (c.amount ?? 0) > 50, whenLabel: '> 50' },
  ],
};

describe('planSteps', () => {
  it('bỏ qua bước không thoả điều kiện', () => {
    const steps = planSteps(def, { requesterId: 'staff', amount: 10 }, org);
    expect(steps.map((s) => s.status)).toEqual(['waiting', 'skipped', 'waiting', 'skipped']);
    expect(steps[3].note).toContain('> 50');
  });

  it('bỏ qua bước trùng người duyệt liền trước', () => {
    const steps = planSteps(def, { requesterId: 'staff', projectId: 'P1', amount: 100 }, org);
    expect(steps.map((s) => [s.approverId, s.status])).toEqual([
      ['lead', 'waiting'],
      ['lead', 'skipped'],
      ['accountant', 'waiting'],
      ['boss', 'waiting'],
    ]);
  });

  it('bỏ qua bước mà người duyệt chính là người đề xuất', () => {
    const steps = planSteps(def, { requesterId: 'lead', projectId: 'P1', amount: 100 }, org);
    expect(steps[0]).toMatchObject({ approverId: 'boss', status: 'waiting' });
    expect(steps[1]).toMatchObject({ approverId: 'lead', status: 'skipped' });
  });

  it('quản lý cấp 2', () => {
    const steps = planSteps({ ...def, steps: [{ id: 'm2', name: 'M2', approver: { type: 'manager', level: 2 } }] }, { requesterId: 'staff' }, org);
    expect(steps[0].approverId).toBe('boss');
  });
});

describe('vòng đời phiếu', () => {
  it('duyệt lần lượt tới khi hoàn tất', () => {
    let wf = startWorkflow(def, { requesterId: 'staff', amount: 100 }, org, NOW);
    expect(wf.status).toBe('pending');
    expect(currentApprover(wf)).toBe('lead');
    wf = actOnWorkflow(wf, 'lead', 'approve', NOW);
    expect(currentApprover(wf)).toBe('accountant');
    wf = actOnWorkflow(wf, 'accountant', 'approve', NOW);
    wf = actOnWorkflow(wf, 'boss', 'approve', NOW, 'OK');
    expect(wf.status).toBe('approved');
    expect(currentApprover(wf)).toBeUndefined();
    expect(wf.history.map((h) => h.action)).toEqual(['submit', 'approve', 'approve', 'approve']);
  });

  it('từ chối kết thúc phiếu', () => {
    const wf = actOnWorkflow(startWorkflow(def, { requesterId: 'staff' }, org, NOW), 'lead', 'reject', NOW, 'Thiếu chứng từ');
    expect(wf.status).toBe('rejected');
    expect(wf.steps[0]).toMatchObject({ status: 'rejected', comment: 'Thiếu chứng từ' });
  });

  it('không cho người khác duyệt thay', () => {
    const wf = startWorkflow(def, { requesterId: 'staff' }, org, NOW);
    expect(() => actOnWorkflow(wf, 'boss', 'approve', NOW)).toThrow();
  });

  it('không có bước nào cần duyệt thì tự hoàn tất', () => {
    const wf = startWorkflow({ ...def, steps: [def.steps[3]] }, { requesterId: 'staff', amount: 1 }, org, NOW);
    expect(wf.status).toBe('approved');
  });
});

describe('cấu hình luồng duyệt mẫu của VIJAKO', () => {
  it('đơn nghỉ trên 3 ngày cần thêm Trưởng phòng HCNS', () => {
    const short = planSteps(WF_LEAVE, { requesterId: 'E005', days: 2 }, ORG).filter((s) => s.status === 'waiting');
    const long = planSteps(WF_LEAVE, { requesterId: 'E005', days: 4 }, ORG).filter((s) => s.status === 'waiting');
    expect(short.map((s) => s.approverId)).toEqual(['E004']);
    expect(long.map((s) => s.approverId)).toEqual(['E004', 'E002']);
  });

  it('tạm ứng công trường của kỹ sư: CHT không duyệt 2 lần, trên 50 triệu cần TGĐ', () => {
    const wf = getTemplate('TAM_UNG').workflow;
    const small = planSteps(wf, { requesterId: 'E005', projectId: 'P01', amount: 8_000_000 }, ORG).filter((s) => s.status === 'waiting');
    const big = planSteps(wf, { requesterId: 'E005', projectId: 'P01', amount: 80_000_000 }, ORG).filter((s) => s.status === 'waiting');
    expect(small.map((s) => s.approverId)).toEqual(['E004', 'E003']);
    expect(big.map((s) => s.approverId)).toEqual(['E004', 'E003', 'E001']);
  });
});
