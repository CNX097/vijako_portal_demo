import dayjs from 'dayjs';
import type { Certificate, Contract, CareerEvent, Department, Employee, RoleKey, Shift, Site } from '../types';
import type { OrgLookup } from '../lib/workflow';
import { ISO, seededRandom } from '../lib/format';

// Toàn bộ dữ liệu dưới đây là DỮ LIỆU MẪU, không phải dữ liệu thật của VIJAKO.

const OFFICE_SHIFT: Shift = { name: 'Ca hành chính', start: '08:00', end: '17:00', workdays: [1, 2, 3, 4, 5] };
const SITE_SHIFT: Shift = { name: 'Ca công trường', start: '07:00', end: '17:00', workdays: [1, 2, 3, 4, 5, 6] };

export const SITES: Site[] = [
  { id: 'VP', name: 'Văn phòng công ty', address: 'Thanh Xuân, Hà Nội', kind: 'office', lat: 20.9937, lng: 105.8031, radius: 100, shift: OFFICE_SHIFT },
  { id: 'P01', name: 'Khu đô thị Ánh Dương — gói 120 căn shophouse', address: 'TP. Phủ Lý, Hà Nam', kind: 'project', lat: 20.5455, lng: 105.9122, radius: 300, managerId: 'E004', shift: SITE_SHIFT },
  { id: 'P02', name: 'Tòa nhà văn phòng Hoàng Long', address: 'Cầu Giấy, Hà Nội', kind: 'project', lat: 21.0331, lng: 105.7942, radius: 150, managerId: 'E009', shift: SITE_SHIFT },
];
export const PROJECTS = SITES.filter((s) => s.kind === 'project');

export const DEPARTMENTS: Department[] = [
  { id: 'BGD', name: 'Ban Giám đốc', siteId: 'VP' },
  { id: 'HCNS', name: 'Phòng Hành chính – Nhân sự', siteId: 'VP' },
  { id: 'TCKT', name: 'Phòng Tài chính – Kế toán', siteId: 'VP' },
  { id: 'KT', name: 'Phòng Kỹ thuật – Thi công', siteId: 'VP' },
  { id: 'BCH1', name: 'BCH công trường Ánh Dương', siteId: 'P01' },
  { id: 'BCH2', name: 'BCH công trường Hoàng Long', siteId: 'P02' },
];

export const POSITIONS: Record<string, string> = {
  TGD: 'Tổng Giám đốc',
  TP_HCNS: 'Trưởng phòng HCNS',
  KTT: 'Kế toán trưởng',
  TP_KT: 'Trưởng phòng Kỹ thuật',
  CHT: 'Chỉ huy trưởng công trường',
  KSGS: 'Kỹ sư giám sát',
  KSQS: 'Kỹ sư QS',
  ATLD: 'Cán bộ an toàn lao động',
  THUKHO: 'Thủ kho công trường',
  KSDT: 'Kỹ sư dự toán',
  KSKC: 'Kỹ sư kết cấu',
  KSMEP: 'Kỹ sư MEP',
  CVCB: 'Chuyên viên C&B',
  CVTD: 'Chuyên viên tuyển dụng',
  KTTT: 'Kế toán thanh toán',
  VT: 'Văn thư',
};

export const ROLE_LABELS: Record<RoleKey, string> = {
  staff: 'Nhân viên',
  site_manager: 'Chỉ huy trưởng',
  hr: 'Quản trị nhân sự',
  chief_accountant: 'Kế toán trưởng',
  director: 'Ban Giám đốc',
};

type Row = [id: string, name: string, gender: 'Nam' | 'Nữ', position: string, dept: string, manager: string | undefined, joined: string, salaryM: number, role: RoleKey];

const ROWS: Row[] = [
  ['E001', 'Phạm Quốc Bảo', 'Nam', 'TGD', 'BGD', undefined, '2008-03-01', 85, 'director'],
  ['E002', 'Lê Thu Hà', 'Nữ', 'TP_HCNS', 'HCNS', 'E001', '2012-06-15', 32, 'hr'],
  ['E003', 'Đỗ Thị Lan', 'Nữ', 'KTT', 'TCKT', 'E001', '2011-09-01', 35, 'chief_accountant'],
  ['E004', 'Trần Minh Đức', 'Nam', 'CHT', 'BCH1', 'E001', '2013-02-20', 38, 'site_manager'],
  ['E005', 'Nguyễn Văn An', 'Nam', 'KSGS', 'BCH1', 'E004', '2019-07-08', 18.5, 'staff'],
  ['E006', 'Hoàng Văn Nam', 'Nam', 'KSQS', 'BCH1', 'E004', '2021-04-12', 17, 'staff'],
  ['E007', 'Vũ Thị Mai', 'Nữ', 'ATLD', 'BCH1', 'E004', '2020-10-05', 15, 'staff'],
  ['E008', 'Bùi Đức Long', 'Nam', 'THUKHO', 'BCH1', 'E004', '2018-01-15', 12.5, 'staff'],
  ['E009', 'Ngô Thanh Tùng', 'Nam', 'CHT', 'BCH2', 'E001', '2014-05-19', 36, 'site_manager'],
  ['E010', 'Đặng Văn Hùng', 'Nam', 'KSGS', 'BCH2', 'E009', '2017-08-21', 19, 'staff'],
  ['E011', 'Lý Minh Châu', 'Nữ', 'KSMEP', 'BCH2', 'E009', '2022-03-07', 17.5, 'staff'],
  ['E012', 'Trịnh Văn Khoa', 'Nam', 'TP_KT', 'KT', 'E001', '2010-11-01', 34, 'staff'],
  ['E013', 'Phan Thị Hương', 'Nữ', 'KSDT', 'KT', 'E012', '2016-04-04', 20, 'staff'],
  ['E014', 'Đinh Quang Huy', 'Nam', 'KSKC', 'KT', 'E012', '2023-09-11', 16, 'staff'],
  ['E015', 'Mai Thị Ngọc', 'Nữ', 'CVCB', 'HCNS', 'E002', '2018-12-03', 14, 'staff'],
  ['E016', 'Cao Thị Thảo', 'Nữ', 'CVTD', 'HCNS', 'E002', '2026-08-17', 11, 'staff'],
  ['E017', 'Tạ Văn Phúc', 'Nam', 'KTTT', 'TCKT', 'E003', '2020-02-24', 13.5, 'staff'],
  ['E018', 'Kiều Thị Yến', 'Nữ', 'VT', 'HCNS', 'E002', '2015-07-13', 10.5, 'staff'],
];

const DISTRICTS = ['Thanh Xuân', 'Cầu Giấy', 'Đống Đa', 'Hà Đông', 'Nam Từ Liêm', 'Hoàng Mai', 'Long Biên', 'Ba Đình'];
const BANKS = ['Vietcombank', 'BIDV', 'Techcombank', 'VietinBank', 'MB'];

const T = dayjs();
const rel = (days: number) => T.add(days, 'day').format(ISO);

function slugEmail(name: string): string {
  const plain = name.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const parts = plain.split(' ');
  const last = parts.pop()!;
  return `${last}.${parts.map((p) => p[0]).join('')}@vijako.demo`;
}

// Chứng chỉ & hợp đồng có ngày hết hạn tính tương đối theo hôm nay để demo luôn có cảnh báo.
const CERTS: Record<string, Certificate[]> = {
  E004: [
    { name: 'Chứng chỉ hành nghề giám sát thi công hạng II', issuer: 'Sở Xây dựng Hà Nội', issued: '2022-05-10', expires: rel(560) },
    { name: 'Huấn luyện ATLĐ nhóm 2', issuer: 'Trung tâm huấn luyện ATVSLĐ', issued: rel(-400), expires: rel(330) },
  ],
  E005: [{ name: 'Huấn luyện ATLĐ nhóm 3', issuer: 'Trung tâm huấn luyện ATVSLĐ', issued: rel(-580), expires: rel(150) }],
  E006: [{ name: 'Huấn luyện ATLĐ nhóm 3', issuer: 'Trung tâm huấn luyện ATVSLĐ', issued: rel(-500), expires: rel(230) }],
  E007: [
    { name: 'Huấn luyện ATLĐ nhóm 2', issuer: 'Trung tâm huấn luyện ATVSLĐ', issued: rel(-710), expires: rel(20) },
    { name: 'Chứng chỉ sơ cấp cứu', issuer: 'Hội Chữ thập đỏ', issued: rel(-300) },
  ],
  E008: [{ name: 'Huấn luyện ATLĐ nhóm 3', issuer: 'Trung tâm huấn luyện ATVSLĐ', issued: rel(-650), expires: rel(80) }],
  E009: [{ name: 'Chứng chỉ hành nghề chỉ huy trưởng hạng I', issuer: 'Bộ Xây dựng', issued: '2021-03-02', expires: rel(420) }],
  E010: [{ name: 'Huấn luyện ATLĐ nhóm 3', issuer: 'Trung tâm huấn luyện ATVSLĐ', issued: rel(-740), expires: rel(-10) }],
  E011: [{ name: 'Huấn luyện ATLĐ nhóm 3', issuer: 'Trung tâm huấn luyện ATVSLĐ', issued: rel(-200), expires: rel(530) }],
  E013: [{ name: 'Chứng chỉ định giá xây dựng hạng II', issuer: 'Sở Xây dựng Hà Nội', issued: '2020-08-14' }],
};

const ASSETS: Record<string, string[]> = {
  E005: ['Laptop Dell Latitude 5440 — TS-CNTT-0231', 'Máy thuỷ bình Leica NA720 — TS-TB-0087', 'Bộ bảo hộ lao động (mũ, giày, áo phản quang)'],
  E004: ['Laptop ThinkPad T14 — TS-CNTT-0102', 'Máy toàn đạc Topcon GM-52 — TS-TB-0041', 'Xe bán tải Ford Ranger — TS-PT-0007'],
  E007: ['Máy đo khí cầm tay — TS-TB-0120', 'Bộ sơ cứu công trường'],
};

function buildEmployee(row: Row, idx: number): Employee {
  const [id, name, gender, positionCode, departmentId, managerId, joinDate, salaryM, role] = row;
  const r = seededRandom(id);
  const dept = DEPARTMENTS.find((d) => d.id === departmentId)!;
  const year = 1972 + Math.floor(r() * 26);
  const dob = dayjs(`${year}-01-01`).add(Math.floor(r() * 364), 'day').format(ISO);
  const yearsIn = T.diff(dayjs(joinDate), 'year');

  const contracts: Contract[] = [];
  if (id === 'E016') {
    contracts.push({ code: 'HĐTV-2026/031', type: 'Hợp đồng thử việc', from: joinDate, to: rel(12) });
  } else if (id === 'E006') {
    contracts.push({ code: 'HĐLĐ-2021/018', type: 'Xác định thời hạn 24 tháng', from: '2021-04-12', to: '2023-04-11' });
    contracts.push({ code: 'HĐLĐ-2023/052', type: 'Xác định thời hạn 36 tháng', from: '2023-04-12', to: rel(45) });
  } else {
    contracts.push({ code: `HĐLĐ-${joinDate.slice(0, 4)}/${String(idx + 3).padStart(3, '0')}`, type: 'Xác định thời hạn 12 tháng', from: joinDate, to: dayjs(joinDate).add(1, 'year').subtract(1, 'day').format(ISO) });
    contracts.push({ code: `HĐLĐ-${dayjs(joinDate).add(1, 'year').format('YYYY')}/${String(idx + 40).padStart(3, '0')}`, type: 'Không xác định thời hạn', from: dayjs(joinDate).add(1, 'year').format(ISO) });
  }

  const history: CareerEvent[] = [
    { date: joinDate, title: 'Tiếp nhận', detail: `Vào công ty, vị trí ${POSITIONS[positionCode]} — ${dept.name}` },
  ];
  if (yearsIn >= 3) history.push({ date: dayjs(joinDate).add(2, 'year').format(ISO), title: 'Điều chỉnh lương', detail: 'Tăng lương định kỳ theo kết quả đánh giá năm' });
  if (id === 'E005') history.push({ date: rel(-380), title: 'Điều chuyển công trường', detail: 'Từ BCH công trường Hoàng Long sang BCH công trường Ánh Dương' });
  if (id === 'E004') history.push({ date: '2019-01-02', title: 'Bổ nhiệm', detail: 'Bổ nhiệm Chỉ huy trưởng công trường' });
  history.sort((a, b) => a.date.localeCompare(b.date));

  return {
    id,
    code: `VJK${id.slice(1)}`,
    name,
    gender,
    dob,
    phone: `0900 000 ${String(100 + idx).padStart(3, '0')}`,
    email: slugEmail(name),
    departmentId,
    positionCode,
    managerId,
    joinDate,
    siteId: dept.siteId,
    idNumber: `001${gender === 'Nam' ? '0' : '1'}••••••${String(Math.floor(r() * 90) + 10)}`,
    address: `${DISTRICTS[Math.floor(r() * DISTRICTS.length)]}, Hà Nội`,
    bankAccount: `${BANKS[Math.floor(r() * BANKS.length)]} •••• ${String(Math.floor(r() * 9000) + 1000)}`,
    salary: salaryM * 1_000_000,
    dependents: Math.floor(r() * 3),
    leaveUsedBefore: id === 'E005' ? 3 : Math.floor(r() * 6),
    contracts,
    history,
    certificates: CERTS[id] ?? [],
    assets: ASSETS[id] ?? ['Laptop văn phòng', 'Thẻ nhân viên'],
    role,
  };
}

export const EMPLOYEES: Employee[] = ROWS.map(buildEmployee);

const byId = new Map(EMPLOYEES.map((e) => [e.id, e]));
export const getEmployee = (id: string): Employee => byId.get(id)!;
export const findEmployee = (id?: string): Employee | undefined => (id ? byId.get(id) : undefined);
export const getSite = (id: string): Site => SITES.find((s) => s.id === id)!;
export const getDepartment = (id: string): Department => DEPARTMENTS.find((d) => d.id === id)!;
export const shiftOf = (e: Employee): Shift => getSite(e.siteId).shift;

/** Các vai trò có thể chuyển đổi trong demo */
export const PERSONAS: { id: string; hint: string }[] = [
  { id: 'E005', hint: 'Kỹ sư công trường: chấm công GPS, tạo đơn, tạo đề xuất' },
  { id: 'E004', hint: 'Chỉ huy trưởng: duyệt đơn của BCH, chấm công hộ tổ đội' },
  { id: 'E002', hint: 'Trưởng phòng HCNS: xem toàn bộ hồ sơ, bảng công, chốt công' },
  { id: 'E003', hint: 'Kế toán trưởng: duyệt tạm ứng, thanh toán' },
  { id: 'E001', hint: 'Tổng Giám đốc: duyệt đề xuất giá trị lớn, xem tổng quan' },
];

export const ORG: OrgLookup = {
  managerOf: (id) => byId.get(id)?.managerId,
  holderOf: (code) => EMPLOYEES.find((e) => e.positionCode === code)?.id,
  projectManagerOf: (projectId) => SITES.find((s) => s.id === projectId)?.managerId,
};

/** Nhân viên cấp dưới (trực tiếp và gián tiếp) */
export function reportsOf(managerId: string): Employee[] {
  const direct = EMPLOYEES.filter((e) => e.managerId === managerId);
  return direct.flatMap((e) => [e, ...reportsOf(e.id)]);
}

export function annualEntitlement(e: Employee): number {
  return 12 + Math.floor(T.diff(dayjs(e.joinDate), 'year') / 5);
}
