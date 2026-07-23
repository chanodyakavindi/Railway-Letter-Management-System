import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import { remindersApi, lettersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, formatDateTime, getLetterRowClasses } from '../utils/helpers';

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

  const reminderHistory = (editLetter?.reminderHistory || [])
    .slice()
    .sort((a, b) => new Date(b.changedAt || b.reminderDate || 0) - new Date(a.changedAt || a.reminderDate || 0));

  const ReminderTable = ({ items, showOverdue, allowComplete = false }) => (
    <table className={`data-table reminder-table${showOverdue ? ' reminder-table--overdue' : ''}`}>
      <colgroup>
        <col className="col-id" />
        <col className="col-subject" />
        <col className="col-org" />
        <col className="col-status" />
        <col className="col-date" />
        {showOverdue && <col className="col-flag" />}
        <col className="col-actions" />
      </colgroup>
      <thead>
        <tr>
          <th>Ref ID</th>
          <th>Subject</th>
          <th>Organization</th>
          <th>Status</th>
          <th>Reminder Date</th>
          {showOverdue && <th>Overdue?</th>}
          <th className="actions-column-header">Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((l) => (
          <tr key={l._id} className={getLetterRowClasses(l.status, l.reminderStatus)}>
            <td className="cell-id">{l.letterId}</td>
            <td><span className="cell-wrap" title={l.title || ''}>{l.title}</span></td>
            <td><span className="cell-wrap" title={l.referredEntity || ''}>{l.referredEntity}</span></td>
            <td className="cell-status"><StatusBadge status={l.status} /></td>
            <td className="cell-date">{formatDate(l.reminderDate)}</td>
            {showOverdue && <td className="cell-flag">{l.reminderStatus === 'overdue' ? 'Yes' : 'No'}</td>}
            <td className="actions-cell">
              <div className="actions-cell-inner">
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
              {data.active.length === 0 ? <EmptyState title="No pending reminders" /> : (
                <div className="table-scroll-container">
                  <ReminderTable items={data.active} showOverdue allowComplete />
                </div>
              )}
            </div>

            <div className="reminder-section-header completed-section-header">
              <h3>Completed ({data.completed.length})</h3>
            </div>
            <div className="card completed-reminders-card" style={{ marginBottom: 24 }}>
              {data.completed.length === 0 ? <EmptyState title="No completed reminders" /> : (
                <div className="table-scroll-container">
                  <ReminderTable items={data.completed} />
                </div>
              )}
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
        <div className="form-field-group">
          <label>Previous Reminder Records</label>
          {reminderHistory.length === 0 ? (
            <div className="table-empty-state" style={{ marginTop: 8 }}>
              <p>No previous reminder records.</p>
            </div>
          ) : (
            <div className="table-scroll-container" style={{ maxHeight: 220, marginTop: 8 }}>
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Reminder</th>
                    <th>Reminder Date</th>
                    <th>Updated At</th>
                    <th>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {reminderHistory.map((h, idx) => (
                    <tr key={`${h._id || 'history'}-${idx}`}>
                      <td>{`Reminder ${idx + 1}`}</td>
                      <td>{formatDate(h.reminderDate)}</td>
                      <td>{formatDateTime(h.changedAt)}</td>
                      <td>{h.notes || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
}
