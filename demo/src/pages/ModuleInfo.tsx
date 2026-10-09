import { useNavigate, useParams } from 'react-router-dom';
import { Button, Card, Col, Result, Row, Tag } from 'antd';
import { CheckOutlined, PlusOutlined } from '@ant-design/icons';
import { getModule } from '../data/modules';

export function ModuleInfo() {
  const { key = '' } = useParams();
  const navigate = useNavigate();
  const m = getModule(key);
  if (!m) return <Result status="404" title="Không tìm thấy module" extra={<Button onClick={() => navigate('/ung-dung')}>Về danh sách ứng dụng</Button>} />;
  const Icon = m.icon;

  return (
    <>
      <div className="page-title">
        <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
          <span className="launcher-icon" style={{ background: m.bg, color: m.color, width: 56, height: 56, fontSize: 24 }}>
            <Icon />
          </span>
          <div>
            <h1>{m.name}</h1>
            <div className="sub">
              {m.group} · <Tag color="blue">{m.phase}</Tag>
              {m.route ? <Tag color="green">Có bản chạy thử</Tag> : <Tag>Chưa có trong bản demo</Tag>}
            </div>
          </div>
        </div>
        {m.route && <Button type="primary" onClick={() => navigate(m.route!)}>Mở bản chạy thử</Button>}
      </div>
      <Card style={{ marginBottom: 16 }}>
        <div style={{ fontSize: 15 }}>{m.summary}</div>
      </Card>
      <Row gutter={[16, 16]}>
        <Col xs={24} md={14}>
          <Card title="Chức năng MVP (lần phát hành đầu)">
            {m.mvp.map((f) => (
              <div key={f} style={{ display: 'flex', gap: 10, padding: '6px 0' }}>
                <CheckOutlined style={{ color: '#16a34a', marginTop: 4 }} />
                <span>{f}</span>
              </div>
            ))}
          </Card>
        </Col>
        <Col xs={24} md={10}>
          <Card title="Mở rộng (sau)">
            {m.later.map((f) => (
              <div key={f} style={{ display: 'flex', gap: 10, padding: '6px 0' }}>
                <PlusOutlined style={{ color: '#6b7280', marginTop: 4 }} />
                <span>{f}</span>
              </div>
            ))}
          </Card>
        </Col>
      </Row>
      <div className="muted" style={{ marginTop: 16, fontSize: 12 }}>Đặc tả đầy đủ: docs/02-dac-ta-module.md</div>
    </>
  );
}
