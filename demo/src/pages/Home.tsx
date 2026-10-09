import { useMemo, type ReactNode } from 'react';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { App, Button, Card, Col, Empty, Row, Space, Tag } from 'antd';
import { ApartmentOutlined, CheckCircleOutlined, EnvironmentOutlined, FormOutlined, SoundOutlined, WarningOutlined } from '@ant-design/icons';
import { AppLauncher } from '../components/AppLauncher';
import { PersonAvatar } from '../components/Person';
import { WorkflowStatusTag } from '../components/WorkflowStatusTag';
import { EMPLOYEES, POSITIONS, ROLE_LABELS, getDepartment, getEmployee, getSite } from '../data/org';
import { LEAVE_TYPES, getTemplate } from '../data/workflows';
import { demoMissingDate } from '../lib/attendance';
import { ISO, fmtDate, fmtDateTime, fmtMoney } from '../lib/format';
import { managedEmployees } from '../lib/permissions';
import { usePendingForMe } from '../store/selectors';
import { useCurrentUser, useDemoStore } from '../store/useDemoStore';

function greeting() {
  const h = dayjs().hour();
  return h < 11 ? 'Chào buổi sáng' : h < 13 ? 'Chào buổi trưa' : h < 18 ? 'Chào buổi chiều' : 'Chào buổi tối';
}

export function Home() {
  const me = useCurrentUser();
  const navigate = useNavigate();
  const { message } = App.useApp();
  const leaves = useDemoStore((s) => s.leaves);
  const proposals = useDemoStore((s) => s.proposals);
  const attendance = useDemoStore((s) => s.attendance);
  const setCurrentUser = useDemoStore((s) => s.setCurrentUser);
  const pending = usePendingForMe();
  const todayStr = dayjs().format(ISO);
  const todayEntry = attendance.find((a) => a.employeeId === me.id && a.date === todayStr);
  const missingDate = demoMissingDate(getEmployee('E005'));

  const switchTo = (id: string) => {
    setCurrentUser(id);
    message.info(`Đang dùng với vai trò ${getEmployee(id).name}`);
  };

  const mine = useMemo(
    () =>
      [
        ...leaves.filter((l) => l.employeeId === me.id).map((l) => ({ id: l.id, at: l.createdAt, title: LEAVE_TYPES[l.type].label, sub: `${fmtDate(l.from)}${l.to !== l.from ? ` – ${fmtDate(l.to)}` : ''}`, status: l.workflow.status, to: `/don-tu?open=${l.id}` })),
        ...proposals.filter((p) => p.requesterId === me.id).map((p) => ({ id: p.id, at: p.createdAt, title: `${getTemplate(p.templateCode).name} · ${p.code}`, sub: fmtMoney(p.amount), status: p.workflow.status, to: `/quy-trinh?open=${p.id}` })),
      ]
        .sort((a, b) => b.at.localeCompare(a.at))
        .slice(0, 5),
    [leaves, proposals, me.id],
  );

  const toApprove = [
    ...pending.leaves.map((l) => ({ id: l.id, who: l.employeeId, title: LEAVE_TYPES[l.type].label, sub: `${fmtDate(l.from)}${l.days > 1 ? ` · ${l.days} ngày` : ''}`, to: `/don-tu?open=${l.id}` })),
    ...pending.proposals.map((p) => ({ id: p.id, who: p.requesterId, title: getTemplate(p.templateCode).name, sub: `${p.code} · ${fmtMoney(p.amount)}`, to: `/quy-trinh?open=${p.id}` })),
  ];

  const alerts = useMemo(() => {
    const out: { key: string; who: string; text: string; level: 'error' | 'warning' }[] = [];
    const limit = dayjs().add(60, 'day').format(ISO);
    for (const e of me.role === 'staff' ? [me] : managedEmployees(me)) {
      for (const c of e.certificates) {
        if (c.expires && c.expires <= limit) {
          const overdue = c.expires < todayStr;
          out.push({ key: `${e.id}${c.name}`, who: e.id, level: overdue ? 'error' : 'warning', text: `${c.name} ${overdue ? 'đã hết hạn' : 'hết hạn'} ${fmtDate(c.expires)}` });
        }
      }
      const last = e.contracts[e.contracts.length - 1];
      if (last?.to && last.to >= todayStr && last.to <= limit) {
        out.push({ key: `${e.id}hd`, who: e.id, level: 'warning', text: `${last.type} kết thúc ${fmtDate(last.to)}` });
      }
    }
    return out.sort((a, b) => (a.level === b.level ? 0 : a.level === 'error' ? -1 : 1));
  }, [me, todayStr]);

  const birthdays = EMPLOYEES.filter((e) => dayjs(e.dob).month() === dayjs().month());

  const guide: { text: ReactNode; action?: ReactNode }[] = [
    {
      text: <>Với vai trò <b>Nguyễn Văn An</b> (kỹ sư công trường), vào <b>Chấm công</b> và chấm công vào bằng GPS — thử cả vị trí ngoài công trường để thấy hệ thống chặn.</>,
      action: <Space wrap><Button size="small" onClick={() => switchTo('E005')}>Dùng vai trò An</Button><Button size="small" type="primary" onClick={() => navigate('/cham-cong')}>Mở Chấm công</Button></Space>,
    },
    {
      text: <>Bảng công của An có ngày <b>{fmtDate(missingDate)}</b> thiếu giờ ra (ô đỏ “?”). Tạo đơn <b>Quên chấm công</b> cho ngày đó, hoặc một đơn <b>nghỉ phép</b> (trên 3 ngày sẽ cần thêm Trưởng phòng HCNS duyệt).</>,
      action: <Button size="small" onClick={() => navigate('/don-tu?new=missing_checkin')}>Tạo đơn giải trình</Button>,
    },
    {
      text: <>Đổi sang <b>Trần Minh Đức</b> (Chỉ huy trưởng): chuông thông báo hiện việc cần duyệt — duyệt đơn của An, thử chấm công hộ tổ đội.</>,
      action: <Button size="small" onClick={() => switchTo('E004')}>Dùng vai trò Đức</Button>,
    },
    {
      text: <>Mở <b>Bảng công</b>: ngày đã giải trình chuyển thành “X”, ngày nghỉ được duyệt hiện “P” — dữ liệu tự chảy từ Đơn từ sang Chấm công.</>,
      action: <Button size="small" onClick={() => navigate('/cham-cong?tab=bang-cong')}>Mở bảng công</Button>,
    },
    {
      text: <>Tạo <b>Đề nghị tạm ứng</b> trên 50 triệu: luồng duyệt tự thêm Tổng Giám đốc. Lần lượt đổi vai trò Đức → Lan → Bảo để duyệt hết các bước.</>,
      action: <Button size="small" onClick={() => navigate('/quy-trinh?new=TAM_UNG')}>Tạo tạm ứng</Button>,
    },
    {
      text: <>Đổi sang <b>Lê Thu Hà</b> (HCNS): xem đầy đủ hồ sơ & lương, cảnh báo chứng chỉ ATLĐ sắp hết hạn, chốt công tháng. So sánh với vai trò An — chỉ thấy danh bạ cơ bản của người khác.</>,
      action: <Button size="small" onClick={() => switchTo('E002')}>Dùng vai trò Hà</Button>,
    },
  ];

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card>
              <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap' }}>
                <PersonAvatar id={me.id} size={52} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ fontSize: 20, fontWeight: 700 }}>{greeting()}, {me.name.split(' ').pop()}!</div>
                  <div className="muted">
                    {POSITIONS[me.positionCode]} · {getDepartment(me.departmentId).name} · <Tag style={{ marginInlineEnd: 0 }}>{ROLE_LABELS[me.role]}</Tag>
                  </div>
                </div>
                <Space wrap>
                  <Button icon={<EnvironmentOutlined />} onClick={() => navigate('/cham-cong')}>Chấm công</Button>
                  <Button icon={<FormOutlined />} onClick={() => navigate('/don-tu?new=1')}>Tạo đơn</Button>
                  <Button type="primary" icon={<ApartmentOutlined />} onClick={() => navigate('/quy-trinh')}>Tạo đề xuất</Button>
                </Space>
              </div>
            </Card>

            <Card title="Kịch bản demo ~5 phút" extra={<span className="muted">làm lần lượt</span>}>
              {guide.map((g, i) => (
                <div className="guide-step" key={i}>
                  <span className="guide-num">{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div>{g.text}</div>
                    {g.action && <div style={{ marginTop: 6 }}>{g.action}</div>}
                  </div>
                </div>
              ))}
            </Card>

            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Card title={<>Cần tôi duyệt {toApprove.length > 0 && <Tag color="red">{toApprove.length}</Tag>}</>} style={{ height: '100%' }}>
                  {toApprove.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có việc cần duyệt" />
                  ) : (
                    toApprove.map((x) => (
                      <div key={x.id} className="list-item-link" style={{ display: 'flex', gap: 10, alignItems: 'center' }} onClick={() => navigate(x.to)}>
                        <PersonAvatar id={x.who} size={30} />
                        <div style={{ flex: 1, lineHeight: 1.3 }}>
                          <div style={{ fontWeight: 600 }}>{x.title}</div>
                          <div className="muted" style={{ fontSize: 12 }}>{getEmployee(x.who).name} · {x.sub}</div>
                        </div>
                      </div>
                    ))
                  )}
                </Card>
              </Col>
              <Col xs={24} md={12}>
                <Card title="Đơn & đề xuất của tôi" style={{ height: '100%' }}>
                  {mine.length === 0 ? (
                    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Chưa có" />
                  ) : (
                    mine.map((x) => (
                      <div key={x.id} className="list-item-link" style={{ display: 'flex', gap: 10, alignItems: 'center' }} onClick={() => navigate(x.to)}>
                        <div style={{ flex: 1, lineHeight: 1.3 }}>
                          <div style={{ fontWeight: 600 }}>{x.title}</div>
                          <div className="muted" style={{ fontSize: 12 }}>{x.sub} · gửi {fmtDateTime(x.at)}</div>
                        </div>
                        <WorkflowStatusTag status={x.status} />
                      </div>
                    ))
                  )}
                </Card>
              </Col>
            </Row>
          </Space>
        </Col>

        <Col xs={24} lg={8}>
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Card title="Chấm công hôm nay" extra={<span className="muted">{dayjs().format('dddd, DD/MM')}</span>}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <CheckCircleOutlined style={{ fontSize: 28, color: todayEntry?.checkIn ? '#16a34a' : '#cbd5e1' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>
                    {todayEntry?.checkIn ? `Vào ${todayEntry.checkIn}${todayEntry.checkOut ? ` · Ra ${todayEntry.checkOut}` : ''}` : 'Chưa chấm công'}
                  </div>
                  <div className="muted" style={{ fontSize: 12 }}>{getSite(me.siteId).name}</div>
                </div>
                <Button type="primary" ghost onClick={() => navigate('/cham-cong')}>Mở</Button>
              </div>
            </Card>

            <Card title="Ứng dụng" styles={{ body: { padding: 12 } }}>
              <AppLauncher compact />
            </Card>

            <Card title={<><WarningOutlined style={{ color: '#d97706' }} /> Cảnh báo nhân sự</>}>
              {alerts.length === 0 ? (
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có cảnh báo trong 60 ngày tới" />
              ) : (
                alerts.slice(0, 6).map((a) => (
                  <div key={a.key} className="list-item-link" style={{ display: 'flex', gap: 10, alignItems: 'center' }} onClick={() => navigate(`/nhan-su/${a.who}`)}>
                    <PersonAvatar id={a.who} size={28} />
                    <div style={{ flex: 1, lineHeight: 1.3 }}>
                      <div style={{ fontWeight: 600, fontSize: 13 }}>{getEmployee(a.who).name}</div>
                      <div style={{ fontSize: 12, color: a.level === 'error' ? '#b91c1c' : '#b45309' }}>{a.text}</div>
                    </div>
                  </div>
                ))
              )}
            </Card>

            <Card title={<><SoundOutlined /> Thông báo nội bộ</>}>
              <div className="list-item-link">
                <Tag color="red">Bắt buộc đọc</Tag>
                <div style={{ fontWeight: 600, marginTop: 4 }}>Quy định bảo hộ lao động tại công trường (bản cập nhật)</div>
                <div className="muted" style={{ fontSize: 12 }}>Phòng HCNS · yêu cầu xác nhận đã đọc</div>
              </div>
              <div className="list-item-link">
                <div style={{ fontWeight: 600 }}>Chào mừng Cao Thị Thảo gia nhập Phòng HCNS</div>
                <div className="muted" style={{ fontSize: 12 }}>Chuyên viên tuyển dụng</div>
              </div>
              {birthdays.length > 0 && (
                <div className="list-item-link">
                  <div style={{ fontWeight: 600 }}>🎂 Sinh nhật tháng {dayjs().month() + 1}</div>
                  <div className="muted" style={{ fontSize: 12 }}>{birthdays.map((b) => b.name).join(', ')}</div>
                </div>
              )}
            </Card>
          </Space>
        </Col>
      </Row>
    </>
  );
}
