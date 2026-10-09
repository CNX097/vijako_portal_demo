import dayjs from 'dayjs';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { AttendanceEntry, LeaveRequest, LeaveType, Proposal } from '../types';
import { ORG, getEmployee, shiftOf } from '../data/org';
import { LEAVE_TYPES, getTemplate } from '../data/workflows';
import { actOnWorkflow, startWorkflow } from '../lib/workflow';
import { countWorkdays } from '../lib/calendar';
import { ISO, nowIso } from '../lib/format';
import { buildSeed } from './seed';

export interface LeaveInput {
  type: LeaveType;
  from: string;
  to: string;
  hours?: number;
  time?: string;
  reason: string;
}

interface DemoData {
  currentUserId: string;
  leaves: LeaveRequest[];
  proposals: Proposal[];
  attendance: AttendanceEntry[];
  lockedMonths: string[];
  seq: number;
}

interface DemoActions {
  setCurrentUser: (id: string) => void;
  createLeave: (input: LeaveInput) => LeaveRequest;
  actLeave: (id: string, action: 'approve' | 'reject', comment?: string) => void;
  createProposal: (templateCode: string, data: Record<string, unknown>) => Proposal;
  actProposal: (id: string, action: 'approve' | 'reject', comment?: string) => void;
  checkIn: (siteId: string, distanceM: number) => void;
  checkOut: (siteId: string, distanceM: number) => void;
  proxyCheckIn: (employeeIds: string[]) => void;
  lockMonth: (month: string) => void;
  reset: () => void;
}

const initialData = (): DemoData => ({
  currentUserId: 'E005',
  attendance: [],
  lockedMonths: [],
  ...buildSeed(),
});

const hhmm = () => dayjs().format('HH:mm');

export const useDemoStore = create<DemoData & DemoActions>()(
  persist(
    (set, get) => ({
      ...initialData(),

      setCurrentUser: (id) => set({ currentUserId: id }),

      createLeave: (input) => {
        const { currentUserId, seq } = get();
        const t = LEAVE_TYPES[input.type];
        const days = t.kind === 'range' ? countWorkdays(input.from, input.to, shiftOf(getEmployee(currentUserId))) : 0;
        const createdAt = nowIso();
        const req: LeaveRequest = {
          id: `L${String(seq + 1).padStart(4, '0')}`,
          employeeId: currentUserId,
          ...input,
          days,
          createdAt,
          workflow: startWorkflow(t.workflow, { requesterId: currentUserId, days }, ORG, createdAt),
        };
        set((s) => ({ leaves: [req, ...s.leaves], seq: s.seq + 1 }));
        return req;
      },

      actLeave: (id, action, comment) =>
        set((s) => ({
          leaves: s.leaves.map((l) => (l.id === id ? { ...l, workflow: actOnWorkflow(l.workflow, s.currentUserId, action, nowIso(), comment) } : l)),
        })),

      createProposal: (templateCode, data) => {
        const { currentUserId, seq, proposals } = get();
        const tpl = getTemplate(templateCode);
        const year = dayjs().format('YYYY');
        const lastNo = Math.max(0, ...proposals.filter((x) => x.code.startsWith(`${tpl.prefix}-${year}-`)).map((x) => Number(x.code.slice(-4))));
        const amount = tpl.amountOf(data);
        const projectId = (data.projectId as string | undefined) || undefined;
        const createdAt = nowIso();
        const p: Proposal = {
          id: `R${String(seq + 1).padStart(4, '0')}`,
          code: `${tpl.prefix}-${year}-${String(lastNo + 1).padStart(4, '0')}`,
          templateCode,
          requesterId: currentUserId,
          title: tpl.titleOf(data),
          amount,
          projectId,
          data,
          createdAt,
          workflow: startWorkflow(tpl.workflow, { requesterId: currentUserId, amount, projectId }, ORG, createdAt),
        };
        set((s) => ({ proposals: [p, ...s.proposals], seq: s.seq + 1 }));
        return p;
      },

      actProposal: (id, action, comment) =>
        set((s) => ({
          proposals: s.proposals.map((p) => (p.id === id ? { ...p, workflow: actOnWorkflow(p.workflow, s.currentUserId, action, nowIso(), comment) } : p)),
        })),

      checkIn: (siteId, distanceM) => {
        const { currentUserId } = get();
        const date = dayjs().format(ISO);
        set((s) => ({
          attendance: [
            ...s.attendance.filter((a) => !(a.employeeId === currentUserId && a.date === date)),
            { employeeId: currentUserId, date, siteId, checkIn: hhmm(), method: 'gps', distanceM },
          ],
        }));
      },

      checkOut: (siteId, distanceM) => {
        const { currentUserId } = get();
        const date = dayjs().format(ISO);
        set((s) => ({
          attendance: s.attendance.map((a) =>
            a.employeeId === currentUserId && a.date === date ? { ...a, siteId, checkOut: hhmm(), distanceM } : a,
          ),
        }));
      },

      proxyCheckIn: (employeeIds) => {
        const { currentUserId } = get();
        const date = dayjs().format(ISO);
        const time = hhmm();
        set((s) => ({
          attendance: [
            ...s.attendance.filter((a) => !(a.date === date && employeeIds.includes(a.employeeId))),
            ...employeeIds.map((id): AttendanceEntry => ({
              employeeId: id,
              date,
              siteId: getEmployee(id).siteId,
              checkIn: time,
              method: 'proxy',
              byId: currentUserId,
            })),
          ],
        }));
      },

      lockMonth: (month) => set((s) => ({ lockedMonths: [...new Set([...s.lockedMonths, month])] })),

      reset: () => set({ ...initialData(), currentUserId: get().currentUserId }),
    }),
    {
      name: 'vijako-portal-demo',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ currentUserId, leaves, proposals, attendance, lockedMonths, seq }) => ({
        currentUserId,
        leaves,
        proposals,
        attendance,
        lockedMonths,
        seq,
      }),
    },
  ),
);

export const useCurrentUser = () => getEmployee(useDemoStore((s) => s.currentUserId));
