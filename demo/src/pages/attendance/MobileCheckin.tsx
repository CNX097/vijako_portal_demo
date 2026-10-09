import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { App, Button, Segmented, Tag } from 'antd';
import { CameraOutlined, CheckCircleFilled, EnvironmentFilled, WifiOutlined } from '@ant-design/icons';
import { getSite } from '../../data/org';
import { dayCell, isLate } from '../../lib/attendance';
import { distanceMeters, formatDistance, offsetNorth } from '../../lib/geo';
import { ISO, avatarColor, fmtDate, initials, toMinutes } from '../../lib/format';
import { useCurrentUser, useDemoStore } from '../../store/useDemoStore';

type Mode = 'inside' | 'outside' | 'real';

function GeoMap({ distance, radius, inZone }: { distance: number; radius: number; inZone: boolean }) {
  // Vòng geofence r=42px; vị trí người dùng đặt theo tỉ lệ, quá xa thì ghim ở mép bản đồ.
  const px = Math.min((distance / radius) * 42, 62);
  const far = distance > radius * 1.5;
  return (
    <div className="geo-map">
      <svg width="100%" height="150" viewBox="0 0 300 150" preserveAspectRatio="xMidYMid slice" role="img" aria-label={`Vị trí cách tâm công trường ${formatDistance(distance)}`}>
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#d6dfec" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="300" height="150" fill="url(#grid)" />
        <path d="M0 110 C80 90 140 130 300 95" stroke="#fff" strokeWidth="10" fill="none" />
        <circle cx="150" cy="80" r="42" fill="rgba(37,99,235,.14)" stroke="#2563eb" strokeDasharray="4 3" />
        <rect x="142" y="72" width="16" height="16" rx="3" fill="#2563eb" />
        <circle cx="150" cy={80 - px} r="7" fill={inZone ? '#16a34a' : '#dc2626'} stroke="#fff" strokeWidth="3" />
        {far && <text x="160" y={80 - px + 4} fontSize="11" fill="#b91c1c" fontWeight="600">cách {formatDistance(distance)}</text>}
      </svg>
    </div>
  );
}

export function MobileCheckin() {
  const me = useCurrentUser();
  const { message } = App.useApp();
  const attendance = useDemoStore((s) => s.attendance);
  const leaves = useDemoStore((s) => s.leaves);
  const checkIn = useDemoStore((s) => s.checkIn);
  const checkOut = useDemoStore((s) => s.checkOut);
  const site = getSite(me.siteId);
  const [now, setNow] = useState(dayjs());
  const [mode, setMode] = useState<Mode>('inside');
  const [realPos, setRealPos] = useState<{ lat: number; lng: number }>();
  const [selfie, setSelfie] = useState<string>();

  useEffect(() => {
    const t = setInterval(() => setNow(dayjs()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => setSelfie(undefined), [me.id]);

  const pos = mode === 'real' && realPos ? realPos : offsetNorth(site, mode === 'inside' ? Math.round(site.radius * 0.12) : 1200);
  const distance = distanceMeters(site, pos);
  const inZone = distance <= site.radius;

  const todayStr = now.format(ISO);
  const entry = attendance.find((a) => a.employeeId === me.id && a.date === todayStr);
  const stage: 'in' | 'out' | 'done' = !entry?.checkIn ? 'in' : !entry.checkOut ? 'out' : 'done';
  const lateMin = toMinutes(now.format('HH:mm')) - toMinutes(site.shift.start);

  const history = useMemo(
    () => Array.from({ length: 6 }, (_, i) => dayjs().subtract(i + 1, 'day').format(ISO)).map((d) => dayCell(me, d, leaves, attendance)),
    [me, leaves, attendance],
  );

  const chooseMode = (m: Mode) => {
    if (m !== 'real') return setMode(m);
    if (!navigator.geolocation) return message.error('Trình duyệt không hỗ trợ định vị');
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setRealPos({ lat: p.coords.latitude, lng: p.coords.longitude });
        setMode('real');
      },
      () => message.error('Không lấy được vị trí — kiểm tra quyền truy cập vị trí của trình duyệt'),
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const submit = () => {
    if (stage === 'in') {
      checkIn(site.id, Math.round(distance));
      message.success(`Đã chấm công vào lúc ${now.format('HH:mm')}`);
    } else {
      checkOut(site.id, Math.round(distance));
      message.success(`Đã chấm công ra lúc ${now.format('HH:mm')}`);
    }
    setSelfie(undefined);
  };

  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-status">
          <span>{now.format('HH:mm')}</span>
          <span><WifiOutlined /> 4G</span>
        </div>
        <div className="phone-head">
          <div style={{ opacity: 0.85, fontSize: 13 }}>{now.format('dddd, DD/MM/YYYY')}</div>
          <div className="clock">{now.format('HH:mm:ss')}</div>
          <div style={{ fontSize: 13, opacity: 0.9 }}>{site.shift.name} · {site.shift.start}–{site.shift.end}</div>
        </div>
        <div className="phone-body">
          <div style={{ background: '#fff', borderRadius: 14, padding: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <EnvironmentFilled style={{ color: '#2563eb' }} />
              <div style={{ lineHeight: 1.25, flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 13 }}>{site.name}</div>
                <div className="muted" style={{ fontSize: 11 }}>{site.address} · bán kính {site.radius} m</div>
              </div>
            </div>
            <GeoMap distance={distance} radius={site.radius} inZone={inZone} />
            <div style={{ marginTop: 8, fontSize: 13, fontWeight: 600, color: inZone ? '#15803d' : '#b91c1c' }}>
              {inZone ? `Trong vùng chấm công · ${formatDistance(distance)}` : `Ngoài vùng chấm công · cách ${formatDistance(distance)}`}
            </div>
            <div style={{ marginTop: 8 }}>
              <div className="muted" style={{ fontSize: 11, marginBottom: 4 }}>Giả lập vị trí (chỉ có trong demo)</div>
              <Segmented<Mode>
                size="small"
                block
                value={mode}
                onChange={chooseMode}
                options={[
                  { value: 'inside', label: 'Trong CT' },
                  { value: 'outside', label: 'Ngoài CT' },
                  { value: 'real', label: 'GPS thật' },
                ]}
              />
            </div>
          </div>

          {stage === 'done' ? (
            <div style={{ background: '#fff', borderRadius: 14, padding: 16, textAlign: 'center' }}>
              <CheckCircleFilled style={{ fontSize: 40, color: '#16a34a' }} />
              <div style={{ fontWeight: 700, marginTop: 6 }}>Đã hoàn thành ca hôm nay</div>
              <div className="muted">Vào {entry!.checkIn} · Ra {entry!.checkOut}</div>
            </div>
          ) : (
            <div style={{ background: '#fff', borderRadius: 14, padding: 12 }}>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                {selfie ? (
                  <div className="selfie" style={{ background: avatarColor(me.id) }}>
                    {initials(me.name)}
                    <small>{selfie}</small>
                  </div>
                ) : (
                  <Button icon={<CameraOutlined />} style={{ width: 64, height: 64 }} onClick={() => setSelfie(dayjs().format('HH:mm:ss'))} aria-label="Chụp ảnh xác thực" />
                )}
                <div style={{ fontSize: 12, lineHeight: 1.4 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{selfie ? 'Đã chụp ảnh xác thực' : 'Chụp ảnh xác thực'}</div>
                  <div className="muted">Ảnh kèm toạ độ & thời gian, chống chấm công hộ trái phép</div>
                </div>
              </div>
              {stage === 'in' && lateMin > 5 && <Tag color="orange" style={{ marginTop: 10 }}>Bạn đang muộn {lateMin >= 60 ? `${Math.floor(lateMin / 60)} giờ ${lateMin % 60} phút` : `${lateMin} phút`} so với giờ vào ca</Tag>}
              {stage === 'out' && <Tag color="blue" style={{ marginTop: 10 }}>Đã vào ca lúc {entry!.checkIn}{isLate(me, entry!.checkIn) ? ' (muộn)' : ''}</Tag>}
              <div style={{ display: 'grid', placeItems: 'center', marginTop: 10 }}>
                <button type="button" className={`checkin-btn${stage === 'out' ? ' out' : ''}`} disabled={!inZone || !selfie} onClick={submit}>
                  {stage === 'in' ? 'VÀO CA' : 'RA CA'}
                </button>
                <div className="muted" style={{ fontSize: 12, marginTop: 4, textAlign: 'center' }}>
                  {!inZone ? 'Chỉ chấm được khi ở trong vùng công trường' : !selfie ? 'Chụp ảnh xác thực để tiếp tục' : 'Sẵn sàng chấm công'}
                </div>
              </div>
            </div>
          )}

          <div style={{ background: '#fff', borderRadius: 14, padding: 12 }}>
            <div style={{ fontWeight: 600, marginBottom: 6 }}>Lịch sử gần đây</div>
            {history.map((c) => (
              <div key={c.date} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '5px 0', borderBottom: '1px solid #f1f5f9', fontSize: 13 }}>
                <span>{dayjs(c.date).format('dd')} {fmtDate(c.date).slice(0, 5)}</span>
                <span className="muted">{c.checkIn ? `${c.checkIn} – ${c.checkOut ?? '??:??'}` : c.note ?? ''}</span>
                <span className={`cell cell-${c.tone}`} style={{ width: 'auto', minWidth: 26, padding: '0 6px' }}>{c.code || '·'}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
