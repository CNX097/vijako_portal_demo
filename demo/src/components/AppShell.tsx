import { useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { Alert, App, Badge, Button, Drawer, Empty, Grid, Layout, Menu, Popconfirm, Popover, Tag } from 'antd';
import { AppstoreOutlined, BellOutlined, HomeOutlined, MenuOutlined, ReloadOutlined } from '@ant-design/icons';
import { getModule } from '../data/modules';
import { getEmployee } from '../data/org';
import { LEAVE_TYPES, getTemplate } from '../data/workflows';
import { usePendingForMe } from '../store/selectors';
import { useDemoStore } from '../store/useDemoStore';
import { AppLauncher } from './AppLauncher';
import { PersonaSwitcher } from './PersonaSwitcher';
import { PersonAvatar } from './Person';

const DEMO_ROUTES = ['hr', 'leave', 'attendance', 'process'];

function moduleIcon(key: string) {
  const m = getModule(key)!;
  const Icon = m.icon;
  return <Icon style={{ color: m.color }} />;
}

export function AppShell() {
  const screens = Grid.useBreakpoint();
  const isDesktop = !!screens.lg;
  const navigate = useNavigate();
  const location = useLocation();
  const { message } = App.useApp();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [launcherOpen, setLauncherOpen] = useState(false);
  const [bellOpen, setBellOpen] = useState(false);
  const reset = useDemoStore((s) => s.reset);
  const pending = usePendingForMe();
  const pendingCount = pending.leaves.length + pending.proposals.length;

  const selected = '/' + (location.pathname.split('/')[1] ?? '');

  const nav = (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Menu
        mode="inline"
        selectedKeys={[selected]}
        style={{ flex: 1, paddingTop: 8 }}
        onClick={({ key }) => {
          navigate(key);
          setDrawerOpen(false);
        }}
        items={[
          { key: '/', icon: <HomeOutlined />, label: 'Trang chủ' },
          { key: '/ung-dung', icon: <AppstoreOutlined />, label: 'Tất cả ứng dụng' },
          {
            key: 'demo',
            type: 'group',
            label: 'Module chạy thử',
            children: DEMO_ROUTES.map((k) => {
              const m = getModule(k)!;
              const count = k === 'leave' ? pending.leaves.length : k === 'process' ? pending.proposals.length : 0;
              return {
                key: m.route!,
                icon: moduleIcon(k),
                label: (
                  <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    {m.name}
                    {count > 0 && <Badge count={count} size="small" />}
                  </span>
                ),
              };
            }),
          },
        ]}
      />
      <div className="sider-footer">
        <Popconfirm
          title="Đặt lại dữ liệu demo?"
          description="Xoá các đơn, đề xuất, lượt chấm công bạn đã tạo."
          okText="Đặt lại"
          cancelText="Huỷ"
          onConfirm={() => {
            reset();
            message.success('Đã đặt lại dữ liệu demo');
          }}
        >
          <Button block icon={<ReloadOutlined />}>Đặt lại dữ liệu demo</Button>
        </Popconfirm>
      </div>
    </div>
  );

  const bellContent = (
    <div style={{ width: 'min(340px, calc(100vw - 48px))' }}>
      {pendingCount === 0 ? (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="Không có việc cần duyệt" />
      ) : (
        [...pending.leaves.map((l) => ({ id: l.id, who: l.employeeId, title: LEAVE_TYPES[l.type].label, to: `/don-tu?open=${l.id}` })),
         ...pending.proposals.map((p) => ({ id: p.id, who: p.requesterId, title: `${getTemplate(p.templateCode).name} · ${p.code}`, to: `/quy-trinh?open=${p.id}` }))].map((x) => (
          <div
            key={x.id}
            className="list-item-link"
            style={{ display: 'flex', gap: 10, alignItems: 'center', margin: 0 }}
            onClick={() => {
              navigate(x.to);
              setBellOpen(false);
            }}
          >
            <PersonAvatar id={x.who} size={30} />
            <div style={{ lineHeight: 1.3 }}>
              <div style={{ fontWeight: 600 }}>{x.title}</div>
              <div className="muted" style={{ fontSize: 12 }}>{getEmployee(x.who).name} gửi — chờ bạn duyệt</div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <header className="app-header">
        {!isDesktop && <Button type="text" icon={<MenuOutlined />} aria-label="Mở menu" onClick={() => setDrawerOpen(true)} />}
        <a className="brand" href="#/">
          <span className="brand-mark">V</span>
          {screens.sm && <span>VIJAKO Portal</span>}
          <Tag color="orange" style={{ marginInlineEnd: 0 }}>DEMO</Tag>
        </a>
        <div className="header-spacer" />
        <Popover
          trigger="click"
          placement="bottomRight"
          open={launcherOpen}
          onOpenChange={setLauncherOpen}
          content={<div className="launcher-popover"><AppLauncher compact onNavigate={() => setLauncherOpen(false)} /></div>}
        >
          <Button type="text" shape="circle" icon={<AppstoreOutlined style={{ fontSize: 18 }} />} aria-label="Ứng dụng" />
        </Popover>
        <Popover trigger="click" placement="bottomRight" title="Cần bạn duyệt" open={bellOpen} onOpenChange={setBellOpen} content={bellContent}>
          <Badge count={pendingCount} size="small" offset={[-4, 4]}>
            <Button type="text" shape="circle" icon={<BellOutlined style={{ fontSize: 18 }} />} aria-label="Thông báo" />
          </Badge>
        </Popover>
        <PersonaSwitcher />
      </header>
      <Layout style={{ background: 'var(--bg)' }}>
        {isDesktop && (
          <Layout.Sider width={232} className="app-sider" style={{ position: 'sticky', top: 56, height: 'calc(100vh - 56px)', overflow: 'auto' }}>
            {nav}
          </Layout.Sider>
        )}
        <Layout.Content>
          <div className="app-content">
            <Alert
              className="no-print"
              type="warning"
              showIcon
              closable
              style={{ marginBottom: 16 }}
              message="Bản demo — dữ liệu mẫu, chỉ lưu trên trình duyệt này. Đổi vai trò người dùng ở góc trên bên phải để thử luồng phê duyệt."
            />
            <Outlet />
          </div>
        </Layout.Content>
      </Layout>
      <Drawer placement="left" width={260} open={drawerOpen && !isDesktop} onClose={() => setDrawerOpen(false)} styles={{ body: { padding: 0 } }} title="VIJAKO Portal">
        {nav}
      </Drawer>
    </Layout>
  );
}
