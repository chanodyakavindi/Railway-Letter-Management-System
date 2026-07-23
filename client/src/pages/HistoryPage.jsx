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
              <table className="data-table history-table">
                <colgroup>
                  <col className="col-datetime" />
                  <col className="col-person" />
                  <col className="col-role" />
                  <col className="col-action" />
                  <col className="col-details" />
                  <col className="col-id" />
                  <col className="col-ip" />
                </colgroup>
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
                      <td className="cell-date">{formatDateTime(log.createdAt)}</td>
                      <td><span className="cell-wrap" title={log.userName || log.user?.fullName || ''}>{log.userName || log.user?.fullName}</span></td>
                      <td className="cell-nowrap">{log.userRole}</td>
                      <td><span className="cell-wrap" title={log.action || ''}>{log.action}</span></td>
                      <td><span className="cell-wrap" title={log.details || ''}>{log.details}</span></td>
                      <td className="cell-id">{log.letterId || log.letterRef?.letterId || '-'}</td>
                      <td className="cell-nowrap">{log.ipAddress || '-'}</td>
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
