import dayjs from 'dayjs';
import { useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Card, Descriptions, List, Result, Table, Tabs, Tag, Timeline } from 'antd';
import { ArrowLeftOutlined, LaptopOutlined, LockOutlined } from '@ant-design/icons';
import type { Certificate, Contract } from '../../types';
import { POSITIONS, ROLE_LABELS, annualEntitlement, findEmployee, getDepartment, getEmployee, getSite } from '../../data/org';
import { ISO, fmtDate, fmtMoney } from '../../lib/format';
import { leaveBalance } from '../../lib/leave';
import { canSeeSalary, profileAccess } from '../../lib/permissions';
import { PersonAvatar } from '../../components/Person';
import { useCurrentUser, useDemoStore } from '../../store/useDemoStore';

const todayStr = () => dayjs().format(ISO);

function expiryTag(expires?: string) {
  if (!expires) return <Tag>Không thời hạn</Tag>;
  const t = todayStr();
  if (expires < t) return <Tag color="red">Đã hết hạn</Tag>;
  if (expires <= dayjs().add(60, 'day').format(ISO)) return <Tag color="orange">Sắp hết hạn · còn {dayjs(expires).diff(dayjs(t), 'day')} ngày</Tag>;
  return <Tag color="green">Còn hiệu lực</Tag>;
}

export function EmployeeDetail() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const me = useCurrentUser();
  const leaves = useDemoStore((s) => s.leaves);
  const e = findEmployee(id);

  if (!e) return <Result status="404" title="Không tìm thấy nhân viên" extra={<Button onClick={() => navigate('/nhan-su')}>Về danh sách</Button>} />;

  const access = profileAccess(me, e);
  const site = getSite(e.siteId);
  const manager = e.managerId ? getEmployee(e.managerId) : undefined;
  const years = dayjs().diff(dayjs(e.joinDate), 'year');
  const months = dayjs().diff(dayjs(e.joinDate), 'month') % 12;
  const bal = leaveBalance(e, leaves);

  const header = (
    <Card style={{ marginBottom: 16 }}>
      <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <PersonAvatar id={e.id} size={64} />
        <div style={{ flex: 1, minWidth: 220 }}>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{e.name}</div>
          <div className="muted">{POSITIONS[e.positionCode]} · {getDepartment(e.departmentId).name}</div>
          <div style={{ marginTop: 6 }}>
            <Tag>{e.code}</Tag>
            <Tag color="blue">{ROLE_LABELS[e.role]}</Tag>
            <Tag color={site.kind === 'office' ? 'default' : 'gold'}>{site.kind === 'office' ? 'Văn phòng' : 'Công trường'}</Tag>
          </div>
        </div>
        <div className="muted" style={{ fontSize: 13, lineHeight: 1.7 }}>
          <div>{e.phone}</div>
          <div>{e.email}</div>
        </div>
      </div>
    </Card>
  );

  const back = (
    <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/nhan-su')} style={{ paddingLeft: 0, marginBottom: 8 }}>
      Danh sách nhân sự
    </Button>
  );

  if (access === 'basic') {
    return (
      <>
        {back}
        {header}
        <Alert
          type="warning"
          showIcon
          icon={<LockOutlined />}
          message="Bạn chỉ xem được thông tin danh bạ của nhân viên này"
          description="Hồ sơ đầy đủ chỉ hiển thị với chính chủ, quản lý trực tiếp / gián tiếp, Phòng HCNS và Ban Giám đốc. Đổi vai trò sang Lê Thu Hà (HCNS) để xem đầy đủ."
        />
      </>
    );
  }

  const salaryVisible = canSeeSalary(me, e);

  return (
    <>
      {back}
      {header}
      <Card>
        <Tabs
          items={[
            {
              key: 'info',
              label: 'Thông tin chung',
              children: (
                <Descriptions
                  bordered
                  size="small"
                  column={{ xs: 1, md: 2 }}
                  items={[
                    { label: 'Giới tính', children: e.gender },
                    { label: 'Ngày sinh', children: fmtDate(e.dob) },
                    { label: 'Số CCCD', children: e.idNumber },
                    { label: 'Địa chỉ', children: e.address },
                    { label: 'Ngày vào công ty', children: fmtDate(e.joinDate) },
                    { label: 'Thâm niên', children: `${years} năm ${months} tháng` },
                    { label: 'Quản lý trực tiếp', children: manager ? <a onClick={() => navigate(`/nhan-su/${manager.id}`)}>{manager.name}</a> : '—' },
                    { label: 'Nơi làm việc', children: `${site.name} — ${site.address}` },
                    { label: 'Ca làm việc', children: `${site.shift.name} ${site.shift.start}–${site.shift.end}` },
                    { label: 'Người phụ thuộc (giảm trừ gia cảnh)', children: e.dependents },
                    { label: 'Tài khoản ngân hàng', children: e.bankAccount },
                    {
                      label: 'Lương cơ bản',
                      children: salaryVisible ? fmtMoney(e.salary) : <span className="muted"><LockOutlined /> Không có quyền xem</span>,
                    },
                    { label: 'Phép năm', children: `Còn ${bal.remaining} / ${annualEntitlement(e)} ngày (đã dùng ${bal.used}, chờ duyệt ${bal.pending})` },
                  ]}
                />
              ),
            },
            {
              key: 'contracts',
              label: 'Hợp đồng',
              children: (
                <Table<Contract>
                  rowKey="code"
                  size="small"
                  pagination={false}
                  dataSource={[...e.contracts].reverse()}
                  scroll={{ x: 600 }}
                  columns={[
                    { title: 'Số hợp đồng', dataIndex: 'code' },
                    { title: 'Loại', dataIndex: 'type' },
                    { title: 'Từ ngày', dataIndex: 'from', render: fmtDate },
                    { title: 'Đến ngày', dataIndex: 'to', render: (d?: string) => (d ? fmtDate(d) : '—') },
                    {
                      title: 'Trạng thái',
                      key: 's',
                      render: (_, c, i) =>
                        i > 0 || (c.to && c.to < todayStr()) ? <Tag>Đã kết thúc</Tag>
                        : c.to && c.to <= dayjs().add(60, 'day').format(ISO) ? <Tag color="orange">Sắp hết hạn — cần gia hạn</Tag>
                        : <Tag color="green">Đang hiệu lực</Tag>,
                    },
                  ]}
                />
              ),
            },
            {
              key: 'history',
              label: 'Quá trình công tác',
              children: (
                <Timeline
                  style={{ marginTop: 12 }}
                  items={[...e.history].reverse().map((h) => ({
                    children: (
                      <div>
                        <b>{h.title}</b> <span className="muted">· {fmtDate(h.date)}</span>
                        <div>{h.detail}</div>
                      </div>
                    ),
                  }))}
                />
              ),
            },
            {
              key: 'certs',
              label: `Chứng chỉ (${e.certificates.length})`,
              children: (
                <Table<Certificate>
                  rowKey="name"
                  size="small"
                  pagination={false}
                  dataSource={e.certificates}
                  scroll={{ x: 640 }}
                  locale={{ emptyText: 'Chưa có chứng chỉ' }}
                  columns={[
                    { title: 'Chứng chỉ', dataIndex: 'name' },
                    { title: 'Nơi cấp', dataIndex: 'issuer' },
                    { title: 'Ngày cấp', dataIndex: 'issued', render: fmtDate },
                    { title: 'Hết hạn', dataIndex: 'expires', render: (d?: string) => (d ? fmtDate(d) : '—') },
                    { title: 'Trạng thái', key: 's', render: (_, c) => expiryTag(c.expires) },
                  ]}
                />
              ),
            },
            {
              key: 'assets',
              label: 'Tài sản đang giữ',
              children: (
                <>
                  <List size="small" dataSource={e.assets} renderItem={(a) => <List.Item><LaptopOutlined style={{ marginRight: 8, color: '#16a34a' }} />{a}</List.Item>} />
                  <div className="muted" style={{ fontSize: 12, marginTop: 8 }}>Dữ liệu từ module Tài sản (GĐ3) — khi nghỉ việc, checklist offboarding tự liệt kê tài sản cần thu hồi.</div>
                </>
              ),
            },
          ]}
        />
      </Card>
    </>
  );
}
