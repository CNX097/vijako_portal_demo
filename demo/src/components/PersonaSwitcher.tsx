import { App, Dropdown, Grid } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { PERSONAS, ROLE_LABELS, getEmployee } from '../data/org';
import { useCurrentUser, useDemoStore } from '../store/useDemoStore';
import { PersonAvatar } from './Person';

export function PersonaSwitcher() {
  const { message } = App.useApp();
  const me = useCurrentUser();
  const setCurrentUser = useDemoStore((s) => s.setCurrentUser);
  const screens = Grid.useBreakpoint();

  const items = [
    { key: 'title', type: 'group' as const, label: 'Đổi vai trò người dùng (demo)' },
    ...PERSONAS.map((p) => {
      const e = getEmployee(p.id);
      return {
        key: p.id,
        label: (
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '4px 0', maxWidth: 320 }}>
            <PersonAvatar id={p.id} size={34} />
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: 600 }}>
                {e.name} <span className="muted" style={{ fontWeight: 400 }}>· {ROLE_LABELS[e.role]}</span>
              </div>
              <div className="muted" style={{ fontSize: 12, whiteSpace: 'normal' }}>{p.hint}</div>
            </div>
          </div>
        ),
      };
    }),
  ];

  return (
    <Dropdown
      trigger={['click']}
      placement="bottomRight"
      menu={{
        items,
        selectable: true,
        selectedKeys: [me.id],
        onClick: ({ key }) => {
          setCurrentUser(key);
          message.info(`Đang dùng với vai trò ${getEmployee(key).name}`);
        },
      }}
    >
      <button type="button" aria-label="Đổi vai trò" style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 0, cursor: 'pointer', padding: 4, font: 'inherit' }}>
        <PersonAvatar id={me.id} size={32} />
        {screens.md && (
          <span style={{ textAlign: 'left', lineHeight: 1.2 }}>
            <span style={{ display: 'block', fontWeight: 600, fontSize: 13 }}>{me.name}</span>
            <span className="muted" style={{ fontSize: 11 }}>{ROLE_LABELS[me.role]}</span>
          </span>
        )}
        <DownOutlined style={{ fontSize: 10, color: '#9ca3af' }} />
      </button>
    </Dropdown>
  );
}
