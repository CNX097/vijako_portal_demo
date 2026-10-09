import { Card, Col, Row } from 'antd';
import { AppLauncher } from '../components/AppLauncher';
import { MODULES } from '../data/modules';

const PHASES = [
  { key: 'GĐ1', title: 'GĐ1 — Vận hành hằng ngày', when: 'go-live dự kiến 05/2027' },
  { key: 'GĐ2', title: 'GĐ2 — Điều hành & văn phòng điện tử', when: '07/2027' },
  { key: 'GĐ3', title: 'GĐ3 — Tiền lương & tài sản', when: '09–10/2027' },
  { key: 'GĐ4', title: 'GĐ4 — Quản trị hiệu suất', when: '10/2027' },
] as const;

export function Apps() {
  return (
    <>
      <div className="page-title">
        <div>
          <h1>Tất cả ứng dụng</h1>
          <div className="sub">20 module · 2 nhóm WORKPLACE và HRM. Module hiển thị rõ có bản chạy thử; module mờ mở trang đặc tả chức năng.</div>
        </div>
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={13}>
          <Card>
            <AppLauncher />
          </Card>
        </Col>
        <Col xs={24} lg={11}>
          <Card title="Lộ trình triển khai">
            {PHASES.map((p) => (
              <div key={p.key} style={{ padding: '10px 0', borderBottom: '1px dashed var(--border)' }}>
                <div style={{ fontWeight: 600 }}>{p.title}</div>
                <div className="muted" style={{ fontSize: 12, marginBottom: 6 }}>{p.when}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {MODULES.filter((m) => m.phase === p.key).map((m) => {
                    const Icon = m.icon;
                    return (
                      <span key={m.key} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: m.bg, color: m.color, fontSize: 13 }}>
                        <Icon /> {m.name}
                      </span>
                    );
                  })}
                </div>
              </div>
            ))}
            <div className="muted" style={{ fontSize: 12, marginTop: 10 }}>Chi tiết: docs/04-lo-trinh-trien-khai.md</div>
          </Card>
        </Col>
      </Row>
    </>
  );
}
