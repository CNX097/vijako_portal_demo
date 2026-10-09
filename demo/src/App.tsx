import { Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { Home } from './pages/Home';
import { Apps } from './pages/Apps';
import { ModuleInfo } from './pages/ModuleInfo';
import { EmployeeList } from './pages/hr/EmployeeList';
import { EmployeeDetail } from './pages/hr/EmployeeDetail';
import { LeavePage } from './pages/leave/LeavePage';
import { AttendancePage } from './pages/attendance/AttendancePage';
import { ProcessPage } from './pages/process/ProcessPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<Home />} />
        <Route path="ung-dung" element={<Apps />} />
        <Route path="ung-dung/:key" element={<ModuleInfo />} />
        <Route path="nhan-su" element={<EmployeeList />} />
        <Route path="nhan-su/:id" element={<EmployeeDetail />} />
        <Route path="don-tu" element={<LeavePage />} />
        <Route path="cham-cong" element={<AttendancePage />} />
        <Route path="quy-trinh" element={<ProcessPage />} />
        <Route path="*" element={<Home />} />
      </Route>
    </Routes>
  );
}
