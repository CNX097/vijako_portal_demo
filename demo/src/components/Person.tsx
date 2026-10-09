import type { ReactNode } from 'react';
import { Avatar } from 'antd';
import { POSITIONS, getEmployee } from '../data/org';
import { avatarColor, initials } from '../lib/format';

export function PersonAvatar({ id, size = 32 }: { id: string; size?: number }) {
  const e = getEmployee(id);
  return (
    <Avatar size={size} style={{ background: avatarColor(id), flex: 'none', fontSize: size * 0.38 }}>
      {initials(e.name)}
    </Avatar>
  );
}

export function PersonLine({ id, sub, size = 32 }: { id: string; sub?: ReactNode; size?: number }) {
  const e = getEmployee(id);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
      <PersonAvatar id={id} size={size} />
      <div style={{ minWidth: 0, lineHeight: 1.3 }}>
        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</div>
        <div className="muted" style={{ fontSize: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {sub ?? POSITIONS[e.positionCode]}
        </div>
      </div>
    </div>
  );
}
