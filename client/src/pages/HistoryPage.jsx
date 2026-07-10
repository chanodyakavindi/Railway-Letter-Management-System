import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import { auditApi } from '../api';
import { formatDateTime } from '../utils/helpers';

export default function HistoryPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  useEffect(() => {
    setLoading(true);
    auditApi.list({ from, to })
      .then(({ data }) => setLogs(data))
      .finally(() => setLoading(false));
  }, [from, to]);

  return (
    <>
      <Header title="History Log / ඉතිහාස සටහන" />
      <div className="content-body">
        <div className="card">
          <div className="history-filter-bar">
            <div className="filters-row">
              <div className="filter-group">
                <label className="filter-label">From Date</label>
                <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              </div>
              <div className="filter-group">
                <label className="filter-label">To Date</label>
                <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
              </div>
              <button type="button" className="btn btn-outline btn-sm" onClick={() => { setFrom(''); setTo(''); }}>Reset</button>
            </div>
          </div>

          {loading ? <Loading /> : logs.length === 0 ? (
            <EmptyState title="No activity logs match your filters" />
          ) : (
            <div className="table-scroll-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date/Time</th>
                    <th>User</th>
                    <th>Role</th>
                    <th>Action</th>
                    <th>Details</th>
                    <th>Letter ID</th>
                    <th>IP</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id}>
                      <td>{formatDateTime(log.createdAt)}</td>
                      <td>{log.userName || log.user?.fullName}</td>
                      <td>{log.userRole}</td>
                      <td>{log.action}</td>
                      <td>{log.details}</td>
                      <td>{log.letterId || log.letterRef?.letterId || '-'}</td>
                      <td>{log.ipAddress || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
