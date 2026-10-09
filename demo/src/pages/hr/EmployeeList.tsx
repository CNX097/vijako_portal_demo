import type { ReactNode } from 'react';
import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, Card, Input, Select, Space, Table, Tabs, Tag, Tree } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import type { Employee } from '../../types';
import { DEPARTMENTS, EMPLOYEES, ROLE_LABELS, getDepartment } from '../../data/org';
import { fmtDate } from '../../lib/format';
import { managedEmployees, profileAccess } from '../../lib/permissions';
import { PersonLine } from '../../components/Person';
import { useCurrentUser } from '../../store/useDemoStore';

const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/gi, 'd').toLowerCase();

type TreeNode = { key: string; title: ReactNode; children: TreeNode[] };

export function EmployeeList() {
  const me = useCurrentUser();
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [dept, setDept] = useState<string>();
  const scope = managedEmployees(me);

  const rows = useMemo(
    () => EMPLOYEES.filter((e) => (!dept || e.departmentId === dept) && (!q || plain(`${e.name} ${e.code}`).includes(plain(q)))),
    [q, dept],
  );

  const tree = useMemo(() => {
    const build = (id: string): TreeNode => ({
      key: id,
      title: <div style={{ padding: '4px 0' }}><PersonLine id={id} size={28} sub={`${EMPLOYEES.find((e) => e.id === id)!.code} · ${getDepartment(EMPLOYEES.find((e) => e.id === id)!.departmentId).name}`} /></div>,
      children: EMPLOYEES.filter((e) => e.managerId === id).map((e) => build(e.id)),
    });
    return EMPLOYEES.filter((e) => !e.managerId).map((e) => build(e.id));
  }, []);

  const office = EMPLOYEES.filter((e) => getDepartment(e.departmentId).siteId === 'VP').length;

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Nhân sự</h1>
          <div className="sub">Hồ sơ nhân viên là nguồn dữ liệu gốc cho chấm công, lương, BHXH, đánh giá</div>
        </div>
      </div>

      <div className="stat-row" style={{ marginBottom: 16 }}>
        <div className="stat-box"><div className="label">Tổng nhân sự</div><div className="value">{EMPLOYEES.length}</div></div>
        <div className="stat-box"><div className="label">Văn phòng</div><div className="value">{office}</div></div>
        <div className="stat-box"><div className="label">Công trường</div><div className="value">{EMPLOYEES.length - office}</div></div>
        <div className="stat-box"><div className="label">Bạn xem đầy đủ</div><div className="value">{scope.length}</div></div>
      </div>

      <Alert
        type="info"
        showIcon
        style={{ marginBottom: 16 }}
        message={`Vai trò ${ROLE_LABELS[me.role]}: xem đầy đủ hồ sơ của ${scope.length === EMPLOYEES.length ? 'toàn công ty' : `${scope.length} người (bản thân và cấp dưới)`}; người khác chỉ hiện thông tin danh bạ. Lương chỉ HCNS, Ban Giám đốc và chính chủ được xem.`}
      />

      <Card>
        <Tabs
          items={[
            {
              key: 'list',
              label: 'Danh sách',
              children: (
                <>
                  <Space wrap style={{ marginBottom: 12 }}>
                    <Input allowClear prefix={<SearchOutlined />} placeholder="Tìm theo tên, mã (có / không dấu)" value={q} onChange={(e) => setQ(e.target.value)} style={{ width: 280 }} />
                    <Select allowClear placeholder="Phòng ban / BCH" value={dept} onChange={setDept} style={{ width: 260 }} options={DEPARTMENTS.map((d) => ({ value: d.id, label: d.name }))} />
                  </Space>
                  <Table<Employee>
                    rowKey="id"
                    dataSource={rows}
                    pagination={false}
                    scroll={{ x: 820 }}
                    onRow={(e) => ({ onClick: () => navigate(`/nhan-su/${e.id}`), style: { cursor: 'pointer' } })}
                    columns={[
                      { title: 'Nhân viên', key: 'name', render: (_, e) => <PersonLine id={e.id} />, width: 260 },
                      { title: 'Mã NV', dataIndex: 'code', width: 90 },
                      { title: 'Phòng ban / BCH', key: 'dept', render: (_, e) => getDepartment(e.departmentId).name },
                      { title: 'Ngày vào', dataIndex: 'joinDate', render: (d: string) => fmtDate(d), width: 110 },
                      { title: 'Điện thoại', dataIndex: 'phone', width: 130 },
                      {
                        title: 'Quyền xem',
                        key: 'access',
                        width: 110,
                        render: (_, e) => (profileAccess(me, e) === 'full' ? <Tag color="green">Đầy đủ</Tag> : <Tag>Danh bạ</Tag>),
                      },
                    ]}
                  />
                </>
              ),
            },
            {
              key: 'org',
              label: 'Sơ đồ tổ chức',
              children: <Tree treeData={tree} defaultExpandAll selectable={false} showLine blockNode onClick={(_, node) => navigate(`/nhan-su/${node.key}`)} />,
            },
          ]}
        />
      </Card>
    </>
  );
}
