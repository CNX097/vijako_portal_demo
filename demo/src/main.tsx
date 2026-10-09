import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App as AntApp, ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';
import dayjs from 'dayjs';
import 'dayjs/locale/vi';
import { AppRoutes } from './App';
import './styles.css';

dayjs.locale('vi');

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConfigProvider
      locale={viVN}
      theme={{
        token: {
          colorPrimary: '#1d4ed8',
          borderRadius: 8,
          fontFamily: "'Be Vietnam Pro', -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
          colorBgLayout: '#f4f6fa',
        },
        components: { Menu: { itemBorderRadius: 8, itemMarginInline: 8 } },
      }}
    >
      <AntApp>
        {/* HashRouter: chạy được trên mọi static host mà không cần cấu hình rewrite */}
        <HashRouter>
          <AppRoutes />
        </HashRouter>
      </AntApp>
    </ConfigProvider>
  </React.StrictMode>,
);
