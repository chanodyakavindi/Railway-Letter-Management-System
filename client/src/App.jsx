import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRoute from './components/RoleRoute';
import AppLayout from './layouts/AppLayout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AddLetterFullPage from './pages/AddLetterFullPage';
import AllLettersPage from './pages/AllLettersPage';
import ActionTrackingPage from './pages/ActionTrackingPage';
import RemindersPage from './pages/RemindersPage';
import UserTrackingPage from './pages/UserTrackingPage';
import HistoryPage from './pages/HistoryPage';
import ExportReportPage from './pages/ExportReportPage';
import UserManagementPage from './pages/UserManagementPage';
import SecretaryInboxPage from './pages/SecretaryInboxPage';
import NotificationsPage from './pages/NotificationsPage';
import Loading from './components/Loading';
import './assets/styles.css';
import './assets/polish.css';
import './assets/app-overrides.css';

function HomeRedirect() {
  const { user, loading } = useAuth();
  if (loading) return <Loading fullPage />;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'admin') return <Navigate to="/users" replace />;
  if (user.role === 'secretary') return <Navigate to="/secretary-inbox" replace />;
  return <Navigate to="/dashboard" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
              <Route index element={<HomeRedirect />} />
              <Route path="dashboard" element={<RoleRoute roles={['head', 'officer']}><DashboardPage /></RoleRoute>} />
              <Route path="add-letter" element={<RoleRoute roles={['officer']}><AddLetterFullPage /></RoleRoute>} />
              <Route path="letters" element={<RoleRoute roles={['head', 'officer']}><AllLettersPage /></RoleRoute>} />
              <Route path="action-tracking" element={<RoleRoute roles={['head', 'officer']}><ActionTrackingPage /></RoleRoute>} />
              <Route path="reminders" element={<RoleRoute roles={['head', 'officer']}><RemindersPage /></RoleRoute>} />
              <Route path="user-tracking" element={<RoleRoute roles={['head', 'admin']}><UserTrackingPage /></RoleRoute>} />
              <Route path="history" element={<RoleRoute roles={['head', 'officer']}><HistoryPage /></RoleRoute>} />
              <Route path="export" element={<RoleRoute roles={['head', 'officer']}><ExportReportPage /></RoleRoute>} />
              <Route path="users" element={<RoleRoute roles={['admin']}><UserManagementPage /></RoleRoute>} />
              <Route path="secretary-inbox" element={<RoleRoute roles={['secretary']}><SecretaryInboxPage /></RoleRoute>} />
              <Route path="notifications" element={<RoleRoute roles={['head', 'officer', 'secretary']}><NotificationsPage /></RoleRoute>} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  );
}
