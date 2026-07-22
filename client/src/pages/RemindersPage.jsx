import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { remindersApi, lettersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, getLetterRowClasses } from '../utils/helpers';

export default function RemindersPage() {
  const { hasRole } = useAuth();
  const { showToast } = useToast();
  const [period, setPeriod] = useState('all');
  const [data, setData] = useState({ active: [], completed: [] });
  const [loading, setLoading] = useState(true);
  const [editLetter, setEditLetter] = useState(null);
  const [reminderDate, setReminderDate] = useState('');
  const [notes, setNotes] = useState('');

  const load = () => {
    setLoading(true);
    remindersApi.list(period).then(({ data: d }) => setData(d)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [period]);

  const openEdit = (l) => {
    setEditLetter(l);
    setReminderDate(l.reminderDate?.split('T')[0] || '');
    setNotes('');
  };

  const saveReminder = async () => {
    if (!reminderDate) {
      showToast('Please select a reminder date', 'error');
      return;
    }
    try {
      await lettersApi.updateReminder(editLetter._id, { reminderDate, notes });
      showToast('Reminder updated');
      setEditLetter(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const completeLetter = async (id) => {
    try {
      await lettersApi.updateStatus(id, { status: 'Completed' });
      showToast('Letter marked completed');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const ReminderTable = ({ items, showOverdue, allowComplete = false }) => (
    <table className="data-table reminder-table">
      <thead>
        <tr>
          <th>Ref ID</th>
          <th>Subject</th>
          <th>Organization</th>
          <th>Status</th>
          <th>Reminder Date</th>
          {showOverdue && <th>Overdue?</th>}
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((l) => (
          <tr key={l._id} className={getLetterRowClasses(l.status, l.reminderStatus)}>
            <td>{l.letterId}</td>
            <td>{l.title}</td>
            <td>{l.referredEntity}</td>
            <td><StatusBadge status={l.status} /></td>
            <td>{formatDate(l.reminderDate)}</td>
            {showOverdue && <td>{l.reminderStatus === 'overdue' ? 'Yes' : 'No'}</td>}
            <td>
              <div className="actions-cell">
                {hasRole('officer') && (
                  <button type="button" className="btn btn-outline btn-sm" onClick={() => openEdit(l)}>Edit</button>
                )}
                {allowComplete && hasRole('officer') && l.status !== 'Completed' && (
                  <button type="button" className="btn btn-primary btn-sm" onClick={() => completeLetter(l._id)}>Complete</button>
                )}
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );

  return (
    <>
      <Header title="Reminders / මතක් කිරීම්" />
      <div className="content-body">
        <div className="btn-group-toggle" style={{ marginBottom: 16 }}>
          {['all', 'daily', 'weekly', 'monthly'].map((p) => (
            <button key={p} type="button" className={`btn btn-outline btn-sm ${period === p ? 'active' : ''}`} onClick={() => setPeriod(p)}>
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>

        {loading ? <Loading /> : (
          <>
            <div className="reminder-section-header">
              <h3>Pending Reminders ({data.active.length})</h3>
            </div>
            <div className="card" style={{ marginBottom: 24 }}>
              {data.active.length === 0 ? <EmptyState title="No pending reminders" /> : <ReminderTable items={data.active} showOverdue allowComplete />}
            </div>

            <div className="reminder-section-header completed-section-header">
              <h3>Completed ({data.completed.length})</h3>
            </div>
            <div className="card completed-reminders-card" style={{ marginBottom: 24 }}>
              {data.completed.length === 0 ? <EmptyState title="No completed reminders" /> : <ReminderTable items={data.completed} />}
            </div>

          </>
        )}
      </div>

      <Modal
        open={!!editLetter}
        onClose={() => setEditLetter(null)}
        title="Edit Reminder"
        subtitle={editLetter?.letterId}
        footer={(
          <>
            <button type="button" className="btn btn-outline" onClick={() => setEditLetter(null)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={saveReminder}>Save</button>
          </>
        )}
      >
        <div className="form-field-group">
          <label>Reminder Date</label>
          <input type="date" value={reminderDate} onChange={(e) => setReminderDate(e.target.value)} />
        </div>
        <div className="form-field-group">
          <label>Notes</label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)} />
        </div>
      </Modal>
    </>
  );
}
