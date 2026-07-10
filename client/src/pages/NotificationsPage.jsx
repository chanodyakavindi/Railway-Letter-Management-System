import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { notificationsApi, dashboardApi } from '../api';
import { formatDateTime } from '../utils/helpers';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    Promise.all([notificationsApi.list(), dashboardApi.dailySummary()])
      .then(([n, s]) => {
        setNotifications(n.data);
        setSummary(s.data);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markAll = async () => {
    await notificationsApi.markAllRead();
    load();
  };

  const markOne = async (id) => {
    await notificationsApi.markRead(id);
    load();
  };

  return (
    <>
      <Header title="Notifications / දැනුම්දීම්" />
      <div className="content-body">
        {summary && (
          <div className="card" style={{ marginBottom: 20 }}>
            <div className="card-header">
              <h3>Daily Summary / දෛනික සාරාංශය</h3>
            </div>
            <div className="summary-grid">
              <div className="summary-item">Pending: <strong>{summary.pending?.length || 0}</strong></div>
              <div className="summary-item">Due Reminders: <strong>{summary.dueReminders?.length || 0}</strong></div>
              <div className="summary-item">Overdue: <strong>{summary.overdue?.length || 0}</strong></div>
              <div className="summary-item">Completed Today: <strong>{summary.completedToday?.length || 0}</strong></div>
              <div className="summary-item">Drafts 7d+: <strong>{summary.oldDrafts?.length || 0}</strong></div>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header">
            <h3>Notifications</h3>
            <button type="button" className="btn btn-outline btn-sm" onClick={markAll}>Mark all read</button>
          </div>
          {loading ? <Loading /> : notifications.length === 0 ? (
            <EmptyState title="No notifications" />
          ) : (
            <div className="notifications-list">
              {notifications.map((n) => (
                <div key={n._id} className={`notification-item ${n.isRead ? 'read' : 'unread'}`} onClick={() => markOne(n._id)}>
                  <div className="notif-type">{n.type}</div>
                  <strong>{n.title}</strong>
                  <p>{n.message}</p>
                  <span className="notif-time">{formatDateTime(n.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
