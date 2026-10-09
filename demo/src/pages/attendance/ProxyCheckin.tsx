import { useState } from 'react';
import dayjs from 'dayjs';
import { Alert, App, Button, Card, Checkbox, Tag } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { getSite, reportsOf } from '../../data/org';
import { ISO } from '../../lib/format';
import { canProxyCheckIn } from '../../lib/permissions';
import { PersonLine } from '../../components/Person';
import { useCurrentUser, useDemoStore } from '../../store/useDemoStore';

/** Chỉ huy trưởng chấm công hộ cho người không có điện thoại / tổ đội */
export function ProxyCheckin() {
  const me = useCurrentUser();
  const { message } = App.useApp();
  const attendance = useDemoStore((s) => s.attendance);
  const proxyCheckIn = useDemoStore((s) => s.proxyCheckIn);
  const [picked, setPicked] = useState<string[]>([]);

  if (!canProxyCheckIn(me)) {
    return (
      <Card title={<><TeamOutlined /> Chấm công hộ tổ đội</>}>
        <Alert type="info" showIcon message="Dành cho Chỉ huy trưởng công trường" description="Đổi vai trò sang Trần Minh Đức để chấm công hộ cho thành viên BCH / tổ đội không dùng điện thoại." />
      </Card>
    );
  }

  const todayStr = dayjs().format(ISO);
  const team = reportsOf(me.id).filter((e) => e.siteId === me.siteId);

  return (
    <Card title={<><TeamOutlined /> Chấm công hộ — {getSite(me.siteId).name}</>}>
      {team.map((e) => {
        const entry = attendance.find((a) => a.employeeId === e.id && a.date === todayStr);
        return (
          <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 0', borderBottom: '1px solid #f1f5f9' }}>
            <Checkbox
              disabled={!!entry?.checkIn}
              checked={picked.includes(e.id)}
              onChange={(ev) => setPicked(ev.target.checked ? [...picked, e.id] : picked.filter((x) => x !== e.id))}
            />
            <div style={{ flex: 1 }}><PersonLine id={e.id} size={28} /></div>
            {entry?.checkIn ? <Tag color="green">{entry.method === 'proxy' ? 'Chấm hộ' : 'Đã chấm'} {entry.checkIn}</Tag> : <Tag>Chưa chấm</Tag>}
          </div>
        );
      })}
      <Button
        type="primary"
        block
        style={{ marginTop: 12 }}
        disabled={!picked.length}
        onClick={() => {
          proxyCheckIn(picked);
          message.success(`Đã chấm công hộ ${picked.length} người — ghi nhận người chấm và thời điểm`);
          setPicked([]);
        }}
      >
        Chấm công vào cho {picked.length || ''} người đã chọn
      </Button>
    </Card>
  );
}
