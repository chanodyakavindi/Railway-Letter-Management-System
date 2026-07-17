import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import LetterDetailsModal from '../components/LetterDetailsModal';
import { lettersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, getLetterRowClasses } from '../utils/helpers';

export default function AllLettersPage() {
  const { hasRole, user } = useAuth();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status: '', search: '', recipient: '', dateFrom: '', dateTo: '' });

  const load = () => {
    setLoading(true);
    lettersApi.list(filters)
      .then(({ data }) => setLetters(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const status = searchParams.get('status') || '';
    const search = searchParams.get('search') || '';
    const recipient = searchParams.get('recipient') || '';
    const dateFrom = searchParams.get('dateFrom') || '';
    const dateTo = searchParams.get('dateTo') || '';
    setFilters({ status, search, recipient, dateFrom, dateTo });
  }, [searchParams]);

  useEffect(() => { load(); }, [filters]);

  const completeLetter = async (id) => {
    try {
      await lettersApi.updateStatus(id, { status: 'Completed' });
      showToast('Letter marked completed');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const canEdit = (l) => hasRole('officer') && l.createdBy?._id === user?._id;

  return (
    <>
      <Header title="All Letters / සියලු ලිපි" search={filters.search} onSearch={(v) => setFilters((f) => ({ ...f, search: v }))} />
      <div className="content-body">
        <div className="all-letters-legend-bar">
          <div className="legend-items">
            <div className="legend-chip chip-upcoming"><span className="chip-swatch" />Draft / New</div>
            <div className="legend-chip chip-overdue"><span className="chip-swatch" />Overdue / No Action</div>
            <div className="legend-chip chip-normal"><span className="chip-swatch" />Completed</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header flex-column-mobile">
            <h3>All Correspondence Letters</h3>
            {hasRole('officer') && <Link to="/add-letter" className="btn btn-primary btn-sm">+ Register New</Link>}
          </div>

          <div className="filters-row" style={{ padding: '0 20px 16px' }}>
            <select value={filters.status} onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}>
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Pending">Pending</option>
              <option value="Completed">Completed</option>
              <option value="Overdue">Overdue</option>
              <option value="NoAction">No Action</option>
            </select>
            <input type="date" value={filters.dateFrom} onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))} />
            <input type="date" value={filters.dateTo} onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))} />
          </div>

          {loading ? <Loading /> : letters.length === 0 ? (
            <EmptyState title="No letters found" message="Try adjusting filters or create a new letter." />
          ) : (
            <div className="table-scroll-container">
              <table className="data-table al-table">
                <thead>
                  <tr>
                    <th>Letter ID</th>
                    <th>Date</th>
                    <th>Subject</th>
                    <th>Organization</th>
                    <th>Status</th>
                    <th>Reminder</th>
                    <th>Recipients</th>
                    <th>Created By</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {letters.map((l) => (
                    <tr key={l._id} className={getLetterRowClasses(l.status, l.reminderStatus)}>
                      <td>{l.letterId}</td>
                      <td>{formatDate(l.dateReceived)}</td>
                      <td>{l.title}</td>
                      <td>{l.referredEntity}</td>
                      <td><StatusBadge status={l.status} reminderStatus={l.reminderStatus} /></td>
                      <td>{formatDate(l.reminderDate)}</td>
                      <td>{(l.sendTo || []).slice(0, 2).join(', ')}</td>
                      <td>{l.createdBy?.fullName}</td>
                      <td className="actions-cell">
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelected(l)}>View</button>
                        {canEdit(l) && <Link to={`/add-letter?edit=${l._id}`} className="btn btn-secondary btn-sm">Edit</Link>}
                        {canEdit(l) && l.status !== 'Completed' && (
                          <button type="button" className="btn btn-primary btn-sm" onClick={() => completeLetter(l._id)}>Complete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
      <LetterDetailsModal letter={selected} open={!!selected} onClose={() => setSelected(null)} />
    </>
  );
}
