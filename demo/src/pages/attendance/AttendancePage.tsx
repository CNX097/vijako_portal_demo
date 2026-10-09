import { useSearchParams } from 'react-router-dom';
import { Card, Col, Row, Tabs } from 'antd';
import { CheckOutlined } from '@ant-design/icons';
import { MobileCheckin } from './MobileCheckin';
import { ProxyCheckin } from './ProxyCheckin';
import { Timesheet } from './Timesheet';

const POINTS = [
  'Mỗi công trường có toạ độ và bán kính geofence riêng (lấy từ module Dự án)',
  'Bắt buộc ảnh xác thực kèm toạ độ, thời gian; chống giả lập vị trí và ràng buộc thiết bị',
  'Văn phòng đồng bộ máy chấm công vân tay / khuôn mặt — cùng một bảng công',
  'Bản chính thức: chấm công khi mất sóng, đồng bộ lại khi có mạng',
  'Đơn nghỉ, công tác, giải trình được duyệt tự cập nhật vào bảng công',
];

export function AttendancePage() {
  const [params, setParams] = useSearchParams();
  const tab = params.get('tab') === 'bang-cong' ? 'bang-cong' : 'mobile';

  return (
    <>
      <div className="page-title">
        <div>
          <h1>Chấm công</h1>
          <div className="sub">Chấm công GPS tại công trường, chấm công hộ, bảng công tự tổng hợp</div>
        </div>
      </div>
      <Tabs
        activeKey={tab}
        onChange={(k) => setParams(k === 'mobile' ? {} : { tab: k }, { replace: true })}
        items={[
          {
            key: 'mobile',
            label: 'Chấm công trên điện thoại',
            children: (
              <Row gutter={[24, 24]}>
                <Col xs={24} md={12} xl={10}>
                  <MobileCheckin />
                </Col>
                <Col xs={24} md={12} xl={14}>
                  <Card title="Điểm chính" style={{ marginBottom: 16 }}>
                    {POINTS.map((p) => (
                      <div key={p} style={{ display: 'flex', gap: 10, padding: '5px 0' }}>
                        <CheckOutlined style={{ color: '#16a34a', marginTop: 4 }} />
                        <span>{p}</span>
                      </div>
                    ))}
                  </Card>
                  <ProxyCheckin />
                </Col>
              </Row>
            ),
          },
          { key: 'bang-cong', label: 'Bảng công tháng', children: <Timesheet /> },
        ]}
      />
    </>
  );
}
