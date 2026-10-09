import { Tooltip } from 'antd';
import { useNavigate } from 'react-router-dom';
import { MODULES, type ModuleGroup } from '../data/modules';

const GROUPS: ModuleGroup[] = ['WORKPLACE', 'HRM'];

/** Màn hình chọn ứng dụng theo ảnh tham chiếu: module có bản chạy thử hiển thị rõ, module khác hiển thị mờ. */
export function AppLauncher({ compact, onNavigate }: { compact?: boolean; onNavigate?: () => void }) {
  const navigate = useNavigate();
  return (
    <div className={compact ? 'launcher-compact' : undefined}>
      {GROUPS.map((g) => (
        <div className="launcher-group" key={g}>
          <div className="launcher-title">{g}</div>
          <div className="launcher-grid">
            {MODULES.filter((m) => m.group === g).map((m) => {
              const Icon = m.icon;
              return (
                <Tooltip key={m.key} title={m.route ? 'Có bản chạy thử' : `${m.phase} — xem đặc tả chức năng`} mouseEnterDelay={0.4}>
                  <button
                    type="button"
                    className={`launcher-tile${m.route ? '' : ' is-muted'}`}
                    onClick={() => {
                      navigate(m.route ?? `/ung-dung/${m.key}`);
                      onNavigate?.();
                    }}
                  >
                    <span className="launcher-icon" style={{ background: m.bg, color: m.color }}>
                      <Icon />
                    </span>
                    <span className="launcher-label">{m.name}</span>
                    {!compact && (m.route ? <span className="launcher-badge">Chạy thử</span> : <span className="muted" style={{ fontSize: 11 }}>{m.phase}</span>)}
                  </button>
                </Tooltip>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
