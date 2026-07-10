import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import LetterDetailsModal from '../components/LetterDetailsModal';
import { lettersApi } from '../api';
import { formatDate } from '../utils/helpers';

export default function ActionTrackingPage() {
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    lettersApi.list({ search })
      .then(({ data }) => setLetters(data))
      .finally(() => setLoading(false));
  }, [search]);

  const routePath = (l) => {
    const creator = l.createdBy?.fullName || 'Officer';
    const targets = (l.sendTo || []).join(' → ');
    return `${creator} → ${targets || '—'}`;
  };

  return (
    <>
      <Header title="Action Tracking / ක්‍රියාමාර්ග ලුහුබැඳීම" search={search} onSearch={setSearch} />
      <div className="content-body">
        <div className="card">
          <div className="card-header">
            <h3>Letter Action & Routing Tracking</h3>
            <Link to="/add-letter" className="btn btn-primary btn-sm">+ Register New</Link>
          </div>
          {loading ? <Loading /> : letters.length === 0 ? (
            <EmptyState title="No correspondences found" />
          ) : (
            <div className="table-scroll-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Letter ID</th>
                    <th>Subject</th>
                    <th>Status</th>
                    <th>Created By</th>
                    <th>Assigned To</th>
                    <th>Copies To</th>
                    <th>Action Taken</th>
                    <th>Reminder</th>
                    <th>Last Updated</th>
                    <th>Route</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {letters.map((l) => (
                    <tr key={l._id}>
                      <td>{l.letterId}</td>
                      <td>{l.title}</td>
                      <td><StatusBadge status={l.status} /></td>
                      <td>{l.createdBy?.fullName}</td>
                      <td>{(l.sendTo || []).join(', ')}</td>
                      <td>{(l.sendCopiesTo || []).join(', ')}</td>
                      <td className="truncate-cell">{l.actionTaken || '-'}</td>
                      <td>{formatDate(l.reminderDate)}</td>
                      <td>{formatDate(l.updatedAt)}</td>
                      <td className="route-path-cell">{routePath(l)}</td>
                      <td>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelected(l)}>View</button>
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
