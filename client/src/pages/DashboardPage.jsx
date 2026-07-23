import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { useAuth } from '../context/AuthContext';
import { dashboardApi, usersApi } from '../api';

function buildPeriodChartData(periodStats) {
  return [
    {
      label: 'Daily',
      draft: periodStats?.daily?.draft || 0,
      completed: periodStats?.daily?.completed || 0,
    },
    {
      label: 'Weekly',
      draft: periodStats?.weekly?.draft || 0,
      completed: periodStats?.weekly?.completed || 0,
    },
    {
      label: 'Monthly',
      draft: periodStats?.monthly?.draft || 0,
      completed: periodStats?.monthly?.completed || 0,
    },
  ];
}

function shortenLabel(value = '') {
  if (value.length <= 12) return value;
  return `${value.slice(0, 10)}..`;
}

function GroupedBarChart({
  data,
  leftKey,
  rightKey,
  leftLabel,
  rightLabel,
  emptyText,
}) {
  const chartWidth = 1000;
  const chartHeight = 320;
  const margin = { top: 20, right: 20, bottom: 58, left: 40 };
  const plotWidth = chartWidth - margin.left - margin.right;
  const plotHeight = chartHeight - margin.top - margin.bottom;
  const rows = data?.length || 0;
  const maxValue = Math.max(
    1,
    ...((data || []).map((row) => Math.max(row[leftKey] || 0, row[rightKey] || 0)))
  );

  if (!rows) {
    return <div className="chart-empty">{emptyText}</div>;
  }

  const groupWidth = plotWidth / rows;
  const barWidth = Math.max(14, Math.min(30, groupWidth * 0.24));
  const gridLines = 5;

  return (
    <>
      <div className="chart-legend-inline">
        <span className="legend-item"><span className="legend-swatch legend-draft" />{leftLabel}</span>
        <span className="legend-item"><span className="legend-swatch legend-completed" />{rightLabel}</span>
      </div>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="svg-chart-svg" role="img" aria-label={`${leftLabel} and ${rightLabel} bar chart`}>
        {Array.from({ length: gridLines + 1 }).map((_, idx) => {
          const y = margin.top + (plotHeight * idx) / gridLines;
          return (
            <line
              key={`grid-${idx}`}
              className="chart-grid-line"
              x1={margin.left}
              y1={y}
              x2={chartWidth - margin.right}
              y2={y}
            />
          );
        })}

        <line className="chart-axis-line" x1={margin.left} y1={margin.top + plotHeight} x2={chartWidth - margin.right} y2={margin.top + plotHeight} />
        <line className="chart-axis-line" x1={margin.left} y1={margin.top} x2={margin.left} y2={margin.top + plotHeight} />

        {data.map((row, index) => {
          const groupStartX = margin.left + index * groupWidth;
          const centerX = groupStartX + groupWidth / 2;
          const leftValue = row[leftKey] || 0;
          const rightValue = row[rightKey] || 0;
          const leftHeight = (leftValue / maxValue) * plotHeight;
          const rightHeight = (rightValue / maxValue) * plotHeight;
          const leftX = centerX - barWidth - 3;
          const rightX = centerX + 3;
          const leftY = margin.top + (plotHeight - leftHeight);
          const rightY = margin.top + (plotHeight - rightHeight);

          return (
            <g key={`group-${row.label}-${index}`}>
              <rect className="chart-bar-draft" x={leftX} y={leftY} width={barWidth} height={leftHeight} rx="4" />
              <rect className="chart-bar-completed" x={rightX} y={rightY} width={barWidth} height={rightHeight} rx="4" />
              <text className="chart-axis-text" x={leftX + barWidth / 2} y={Math.max(12, leftY - 6)} textAnchor="middle">{leftValue}</text>
              <text className="chart-axis-text" x={rightX + barWidth / 2} y={Math.max(12, rightY - 6)} textAnchor="middle">{rightValue}</text>
              <text className="chart-axis-text" x={centerX} y={margin.top + plotHeight + 18} textAnchor="middle">{shortenLabel(row.label)}</text>
            </g>
          );
        })}
      </svg>
    </>
  );
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [period, setPeriod] = useState('daily');
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [periodStats, setPeriodStats] = useState({ daily: null, weekly: null, monthly: null });
  const [loading, setLoading] = useState(true);

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
      dashboardApi.stats('daily'),
      dashboardApi.stats('weekly'),
      dashboardApi.stats('monthly'),
    ])
      .then(([s, _r, d, daily, weekly, monthly]) => {
        setStats(s.data);
        setSummary(d.data);
        setPeriodStats({
          daily: daily.data,
          weekly: weekly.data,
          monthly: monthly.data,
        });
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

  const letterStatusChartData = buildPeriodChartData(periodStats);
  const staffActivityChartData = [...tracking]
    .map((t) => ({
      id: t.user._id,
      label: t.user.fullName,
      draft: t.stats?.draft || 0,
      completed: t.stats?.completed || 0,
      total: (t.stats?.draft || 0) + (t.stats?.completed || 0),
    }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 8);

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
            {/* <div className="stat-card border-left-orange">
              <div className="stat-main"><span className="stat-number">{stats?.pending || 0}</span></div>
              <span className="stat-label">Pending / පොරොත්තු</span>
            </div> */}
            {/* <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}>
              <div className="stat-main"><span className="stat-number">{stats?.noAction || 0}</span></div>
              <span className="stat-label">No Action / ක්‍රියාමාර්ග නැත</span>
            </div> */}
          </div>

          {/* <div className="quick-actions-bar">
            <Link to="/add-letter" className="btn btn-primary btn-sm">+ Add Letter</Link>
            <Link to="/letters" className="btn btn-secondary btn-sm">All Letters</Link>
            <Link to="/reminders" className="btn btn-secondary btn-sm">Reminders</Link>
            <Link to="/export" className="btn btn-outline btn-sm">Export Report</Link>
          </div> */}

          <div className="dashboard-charts-grid">
            <div className="card chart-card">
              <div className="card-header">
                <h3>Letter Status</h3>
              </div>
              <div className="svg-chart-container">
                <GroupedBarChart
                  data={letterStatusChartData}
                  leftKey="draft"
                  rightKey="completed"
                  leftLabel="Draft"
                  rightLabel="Completed"
                  emptyText="No letter status data available"
                />
              </div>
              <div className="chart-caption">Draft vs completed counts by dashboard periods.</div>
            </div>

            <div className="card chart-card">
              <div className="card-header">
                <h3>Staff Activity (8am-5pm)</h3>
              </div>
              <div className="svg-chart-container">
                <GroupedBarChart
                  data={staffActivityChartData}
                  leftKey="draft"
                  rightKey="completed"
                  leftLabel="Draft"
                  rightLabel="Completed"
                  emptyText="No staff activity data available"
                />
              </div>
              <div className="chart-caption">Top 8 staff based on draft + completed letters.</div>
            </div>
          </div>

          {/* {summary && (
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
          )} */}

        </section>
      </div>
    </>
  );
}
