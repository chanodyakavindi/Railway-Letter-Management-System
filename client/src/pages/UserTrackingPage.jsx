import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { usersApi } from '../api';
import { formatDateTime } from '../utils/helpers';

export default function UserTrackingPage() {
  const [tracking, setTracking] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    usersApi.tracking()
      .then(({ data }) => {
        setTracking(data);
        if (data.length) setSelected(data[0]);
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Header title="User Tracking / පරිශීලක ලුහුබැඳීම" />
      <div className="content-body">
        {loading ? <Loading /> : (
          <>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">
                <h3>Staff Overview</h3>
                <select
                  value={selected?.user?._id || ''}
                  onChange={(e) => setSelected(tracking.find((t) => t.user._id === e.target.value))}
                >
                  {tracking.map((t) => (
                    <option key={t.user._id} value={t.user._id}>{t.user.fullName} ({t.user.role})</option>
                  ))}
                </select>
              </div>
              <div className="table-scroll-container">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Employee ID</th>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Active</th>
                      <th>Completed</th>
                      <th>Drafts</th>
                      <th>Pending</th>
                      <th>Overdue</th>
                      <th>Last Activity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tracking.map((t) => (
                      <tr key={t.user._id} onClick={() => setSelected(t)} style={{ cursor: 'pointer' }}>
                        <td>{t.user.employeeId || t.user.username}</td>
                        <td>{t.user.fullName}</td>
                        <td>{t.user.role}</td>
                        <td>{t.user.isActive ? 'Yes' : 'No'}</td>
                        <td>{t.stats.completed}</td>
                        <td>{t.stats.draft}</td>
                        <td>{t.stats.pending}</td>
                        <td>{t.stats.overdue}</td>
                        <td>{formatDateTime(t.user.lastActivityAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {selected && (
              <div className="card">
                <div className="card-header">
                  <h3>{selected.user.fullName} — Letter Activity</h3>
                </div>
                <div className="stats-card-grid four-cols" style={{ padding: '0 20px 20px' }}>
                  <div className="stat-card border-left-green"><span className="stat-number">{selected.stats.completed}</span><span className="stat-label">Completed</span></div>
                  <div className="stat-card border-left-orange"><span className="stat-number">{selected.stats.draft}</span><span className="stat-label">Drafts</span></div>
                  <div className="stat-card border-left-blue"><span className="stat-number">{selected.stats.pending}</span><span className="stat-label">Pending</span></div>
                  <div className="stat-card" style={{ borderLeft: '4px solid #ef4444' }}><span className="stat-number">{selected.stats.overdue}</span><span className="stat-label">Overdue</span></div>
                </div>
                {selected.stats.recentLetters?.length === 0 ? (
                  <EmptyState title="No letters for this user" />
                ) : (
                  <div className="table-scroll-container">
                    <table className="data-table">
                      <thead>
                        <tr>
                          <th>Letter ID</th>
                          <th>Subject</th>
                          <th>Status</th>
                          <th>Updated</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selected.stats.recentLetters.map((l) => (
                          <tr key={l._id}>
                            <td>{l.letterId}</td>
                            <td>{l.title}</td>
                            <td>{l.status}</td>
                            <td>{formatDateTime(l.updatedAt)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}
