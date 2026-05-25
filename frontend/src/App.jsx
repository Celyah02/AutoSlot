import { Navigate, Route, Routes } from 'react-router-dom';
import DashboardLayout from './components/DashboardLayout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleGuard from './components/RoleGuard';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import NotFoundPage from './pages/NotFoundPage';
import ParkingManagementPage from './pages/ParkingManagementPage';
import ReportsPage from './pages/ReportsPage';
import SignupPage from './pages/SignupPage';
import CarEntryPage from './pages/CarEntryPage';
import CarExitPage from './pages/CarExitPage';

const App = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/login" element={<LoginPage />} />

    <Route
      element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }
    >
      <Route path="/dashboard" element={<DashboardPage />} />
      <Route
        path="/parking-management"
        element={
          <RoleGuard allowedRoles={['admin']}>
            <ParkingManagementPage />
          </RoleGuard>
        }
      />
      <Route path="/car-entry" element={<CarEntryPage />} />
      <Route path="/car-exit" element={<CarExitPage />} />
      <Route path="/reports" element={<ReportsPage />} />
    </Route>

    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

export default App;
