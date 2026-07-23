import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { lettersApi, reportsApi } from '../api';
import { downloadWithAuth, formatDate } from '../utils/helpers';
import { useToast } from '../context/ToastContext';

export default function ExportReportPage() {
  const { showToast } = useToast();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', dateFrom: '', dateTo: '', search: '' });

  useEffect(() => {
    setLoading(true);
    lettersApi.list(filters).then(({ data }) => setLetters(data)).finally(() => setLoading(false));
  }, [filters]);

  const exportFile = async (type) => {
    try {
      const url = type === 'csv' ? reportsApi.csvUrl(filters) : reportsApi.pdfUrl(filters);
      await downloadWithAuth(url, `rlms-report.${type === 'csv' ? 'csv' : 'pdf'}`);
      showToast(`${type.toUpperCase()} export downloaded`);
    } catch {
      showToast('Export failed', 'error');
    }
  };

  return (
    <>
      <Header title="Export Report / ලිපි නිර්යාතය" />
      <div className="content-body">
        <div className="card">
          <div className="card-header">
            <h3>Letter Export</h3>
            <div className="export-action-buttons">
              <button type="button" className="btn btn-secondary btn-sm" onClick={() => exportFile('csv')}>Export CSV</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => exportFile('pdf')}>Export PDF</button>
            </div>
          </div>

          <div className="export-filters-bar">
            <div className="filters-row">
              <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
              <input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} />
              <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
                <option value="">All Status</option>
                <option value="Draft">Draft</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
              <input type="text" placeholder="Search..." value={filters.search} onChange={(e) => setFilters((f) => ({ ...f, search: e.target.value }))} />
            </div>
          </div>

          {loading ? <Loading /> : letters.length === 0 ? (
            <EmptyState title="No letters match export filters" />
          ) : (
            <div className="table-scroll-container">
              <table className="data-table export-table">
                <colgroup>
                  <col className="col-id" />
                  <col className="col-date" />
                  <col className="col-org" />
                  <col className="col-subject" />
                  <col className="col-route" />
                  <col className="col-status" />
                  <col className="col-text" />
                </colgroup>
                <thead>
                  <tr>
                    <th>Ref ID</th>
                    <th>Date</th>
                    <th>Organization</th>
                    <th>Subject</th>
                    <th>Route</th>
                    <th>Status</th>
                    <th>Action Taken</th>
                  </tr>
                </thead>
                <tbody>
                  {letters.map((l) => (
                    <tr key={l._id}>
                      <td className="cell-id">{l.letterId}</td>
                      <td className="cell-date">{formatDate(l.dateReceived)}</td>
                      <td><span className="cell-wrap" title={l.referredEntity || ''}>{l.referredEntity}</span></td>
                      <td><span className="cell-wrap" title={l.title || ''}>{l.title}</span></td>
                      <td><span className="cell-wrap cell-muted" title={(l.sendTo || []).join(' → ')}>{(l.sendTo || []).join(' → ')}</span></td>
                      <td className="cell-status"><StatusBadge status={l.status} /></td>
                      <td><span className="cell-wrap" title={l.actionTaken || ''}>{l.actionTaken || '-'}</span></td>
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
