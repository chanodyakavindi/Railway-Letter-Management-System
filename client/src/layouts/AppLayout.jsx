import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { remindersApi } from '../api';
import Loading from '../components/Loading';

export default function AppLayout() {
  const { logout, loading } = useAuth();
  const navigate = useNavigate();
  const [reminderCount, setReminderCount] = useState(0);

  useEffect(() => {
    remindersApi.summary()
      .then(({ data }) => setReminderCount((data.upcoming || 0) + (data.overdue || 0)))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) return <Loading fullPage />;

  return (
    <div id="app-screen" className="screen active">
      <Sidebar reminderCount={reminderCount} onLogout={handleLogout} />
      <div className="main-workspace">
        <Outlet />
      </div>
    </div>
  );
}
