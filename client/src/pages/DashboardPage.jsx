import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Loading from '../components/Loading';
import StatusBadge from '../components/StatusBadge';
import LetterDetailsModal from '../components/LetterDetailsModal';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, usersApi } from '../api';
import { formatDate } from '../utils/helpers';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [period, setPeriod] = useState('daily');
  const [stats, setStats] = useState(null);
  const [recent, setRecent] = useState([]);
  const [summary, setSummary] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  const navigateToLetters = (status = '') => {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    navigate(`/letters${query}`);
  };

  const navigateToReminders = () => navigate('/reminders');
  const navigateToUserTracking = (userId) => navigate(`/user-tracking?user=${encodeURIComponent(userId)}`);

  const keyboardClick = (action) => (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action();
    }
  };

  useEffect(() => {
    setLoading(true);
    Promise.all([
      dashboardApi.stats(period),
      dashboardApi.recent(),
      dashboardApi.dailySummary(),
    ])
      .then(([s, r, d]) => {
        setStats(s.data);
        // Defensive: ensure `recent` is always an array before using .map
        if (!r || !r.data) {
          console.warn('dashboard.recent returned empty response', r);
          setRecent([]);
        } else if (Array.isArray(r.data)) {
          setRecent(r.data);
        } else if (typeof r.data === 'object' && r.data.items && Array.isArray(r.data.items)) {
          // Support alternative response shape { items: [...] }
          setRecent(r.data.items);
        } else {
          console.warn('dashboard.recent returned unexpected shape:', r.data);
          setRecent([]);
        }
        setSummary(d.data);
      })
      .catch((err) => {
        console.error('Dashboard load failed', err);
      })
      .finally(() => setLoading(false));
  }, [period]);

  useEffect(() => {
    usersApi.tracking()
      .then(({ data }) => setTracking(data || []))
      .catch((err) => {
        console.error('User tracking load failed', err);
        setTracking([]);
      });
  }, []);

  if (loading) {
    return (
      <>
        <Header title="Dashboard / පුවරුව" />
        <div className="content-body"><Loading /></div>
      </>
    );
  }

  return (
    <>
      <Header title="Dashboard / පුවරුව" />
      <div className="content-body">
        <section className="app-page active">
          <div className="welcome-banner">
            <div className="welcome-texts">
              <h1>ආයුබෝවන්, {user?.fullName}!</h1>
              <p>Welcome to the Railway Letter Management portal.</p>
            </div>
            <div className="welcome-gradient-shape" />
          </div>

          <div className="btn-group-toggle" style={{ marginBottom: 16 }}>
            {['daily', 'weekly', 'monthly'].map((p) => (
              <button
                key={p}
                type="button"
                className={`btn btn-outline btn-sm ${period === p ? 'active' : ''}`}
                onClick={() => setPeriod(p)}
              >
                {p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          <div className="stats-card-grid four-cols">
            <div
              className="stat-card border-left-orange clickable-card"
              role="button"
              tabIndex={0}
              onClick={() => navigateToLetters('Draft')}
              onKeyDown={keyboardClick(() => navigateToLetters('Draft'))}
            >
              <div className="stat-main"><span className="stat-number">{stats?.draft || 0}</span></div>
              <span className="stat-label">Draft Letters / කෙටුම්පත්</span>
            </div>
            <div
              className="stat-card border-left-green clickable-card"
              role="button"
              tabIndex={0}
              onClick={() => navigateToLetters('Completed')}
              onKeyDown={keyboardClick(() => navigateToLetters('Completed'))}
            >
              <div className="stat-main"><span className="stat-number">{stats?.completed || 0}</span></div>
              <span className="stat-label">Completed / අවසන්</span>
            </div>
            <div
              className="stat-card border-left-blue clickable-card"
              role="button"
              tabIndex={0}
              onClick={() => navigateToLetters()}
              onKeyDown={keyboardClick(() => navigateToLetters())}
            >
              <div className="stat-main"><span className="stat-number">{stats?.total || 0}</span></div>
              <span className="stat-label">All Letters / සියලු</span>
            </div>
            <div
              className="stat-card border-left-purple clickable-card"
              role="button"
              tabIndex={0}
              onClick={navigateToReminders}
              onKeyDown={keyboardClick(navigateToReminders)}
            >
              <div className="stat-main">
                <span className="stat-number">{stats?.activeReminders || 0}</span>
                <div className="stat-sub-metrics">
                  <span>{stats?.overdue || 0} Overdue</span>
                </div>
              </div>
              <span className="stat-label">Reminders / මතක් කිරීම්</span>
            </div>
          </div>

          <div className="stats-card-grid four-cols" style={{ marginTop: 12 }}>
            <div className="stat-card border-left-orange">
              <div className="stat-main"><span className="stat-number">{stats?.pending || 0}</span></div>
              <span className="stat-label">Pending / පොරොත්තු</span>
            </div>
            <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="stat-main"><span className="stat-number">{stats?.noAction || 0}</span></div>
              <span className="stat-label">No Action / ක්‍රියාමාර්ග නැත</span>
            </div>
          </div>

          <div className="quick-actions-bar">
            <Link to="/add-letter" className="btn btn-primary btn-sm">+ Add Letter</Link>
            <Link to="/letters" className="btn btn-secondary btn-sm">All Letters</Link>
            <Link to="/reminders" className="btn btn-secondary btn-sm">Reminders</Link>
            <Link to="/export" className="btn btn-outline btn-sm">Export Report</Link>
          </div>

          {summary && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <h3>Daily Summary / දෛනික සාරාංශය</h3>
              </div>
              <div className="summary-grid">
                <div className="summary-item">Pending: <strong>{summary.pending?.length || 0}</strong></div>
                <div className="summary-item">Due Today: <strong>{summary.dueReminders?.length || 0}</strong></div>
                <div className="summary-item">Overdue: <strong>{summary.overdue?.length || 0}</strong></div>
                <div className="summary-item">Completed Today: <strong>{summary.completedToday?.length || 0}</strong></div>
                <div className="summary-item">Old Drafts (7d+): <strong>{summary.oldDrafts?.length || 0}</strong></div>
              </div>
            </div>
          )}

          {tracking.length > 0 && (
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <h3>User Activity / පරිශීලක ක්‍රියාකාරීත්වය</h3>
              </div>
              <div className="user-bar-chart">
                {tracking.map((t) => {
                  const totalCount = t.stats.completed + t.stats.draft + t.stats.pending + t.stats.overdue;
                  const maxCount = Math.max(1, stats?.total || totalCount);
                  const width = Math.min(100, Math.round((totalCount / maxCount) * 100));
                  return (
                    <div
                      key={t.user._id}
                      className="user-bar-row"
                      role="button"
                      tabIndex={0}
                      onClick={() => navigateToUserTracking(t.user._id)}
                      onKeyDown={keyboardClick(() => navigateToUserTracking(t.user._id))}
                    >
                      <span className="user-bar-label">{t.user.fullName}</span>
                      <span className="user-bar-visual">
                        <span className="user-bar-fill" style={{ width: `${width}%` }} />
                      </span>
                      <span className="user-bar-value">{totalCount}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="card">
            <div className="card-header">
              <h3>Recent Correspondences / මෑත ලිපි</h3>
            </div>
            <div className="table-scroll-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Date</th>
                    <th>Organization</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((l) => (
                    <tr key={l._id}>
                      <td>{l.letterId}</td>
                      <td>{formatDate(l.dateReceived)}</td>
                      <td>{l.referredEntity}</td>
                      <td>{l.title}</td>
                      <td><StatusBadge status={l.status} /></td>
                      <td>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelected(l)}>View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
      <LetterDetailsModal letter={selected} open={!!selected} onClose={() => setSelected(null)} />
    </>
  );
}
