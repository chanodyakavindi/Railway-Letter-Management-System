import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Loading from '../components/Loading';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import LetterDetailsModal from '../components/LetterDetailsModal';
import Modal from '../components/Modal';
import { lettersApi } from '../api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { formatDate, buildLetterFormData } from '../utils/helpers';

export default function SecretaryInboxPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showToast } = useToast();
  const [letters, setLetters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState(null);
  const [replyLetter, setReplyLetter] = useState(null);
  const [note, setNote] = useState('');
  const [pdfFile, setPdfFile] = useState(null);
  const [completed, setCompleted] = useState(false);

  const load = () => {
    setLoading(true);
    lettersApi.list({ search, inbox: 'secretary' })
      .then(({ data }) => setLetters(data))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const submitReply = async () => {
    try {
      const fd = buildLetterFormData({ note, completed: String(completed) }, pdfFile);
      await lettersApi.addReply(replyLetter._id, fd);
      showToast('Reply saved');
      setReplyLetter(null);
      setNote('');
      setPdfFile(null);
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Reply failed', 'error');
    }
  };

const openReplyForm = (letter) => {
  navigate(`/replytoletter/${letter._id}`, {
    state: { title: letter.title }
  });
};

  return (
    <>
      <Header title="Secretary Inbox / ලේකම් එන ලිපි" search={search} onSearch={setSearch} />
      <div className="content-body">
        <div className="card">
          <div className="card-header">
            <h3>Inbox — {user?.secretaryCategory}</h3>
            <p>View and reply to letters assigned to your category</p>
          </div>

          {loading ? <Loading /> : letters.length === 0 ? (
            <EmptyState title="No letters in your inbox" />
          ) : (
            <div className="table-scroll-container">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Ref</th>
                    <th>Subject</th>
                    <th>From</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {letters.map((l) => (
                    <tr key={l._id}>
                      <td>{formatDate(l.dateReceived)}</td>
                      <td>{l.letterId}</td>
                      <td>{l.title}</td>
                      <td>{l.referredEntity}</td>
                      <td><StatusBadge status={l.status} /></td>
                      <td>
                        <button type="button" className="btn btn-outline btn-sm" onClick={() => setSelected(l)}>View</button>
                        <button type="button" className="btn btn-primary btn-sm" onClick={() => openReplyForm(l)}>Reply</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <LetterDetailsModal
        letter={selected}
        open={!!selected}
        onClose={() => setSelected(null)}
        onReply={(l) => { setSelected(null); openReplyForm(l); }}
      />

      <Modal
        open={!!replyLetter}
        onClose={() => setReplyLetter(null)}
        title="Reply / Action Panel"
        subtitle={replyLetter?.letterId}
        footer={(
          <>
            <button type="button" className="btn btn-outline" onClick={() => setReplyLetter(null)}>Cancel</button>
            <button type="button" className="btn btn-primary" onClick={submitReply}>Save Reply</button>
          </>
        )}
      >
        <p><strong>Subject:</strong> {replyLetter?.title}</p>
        <div className="form-field-group">
          <label>Reply Notes *</label>
          <textarea rows={4} value={note} onChange={(e) => setNote(e.target.value)} required />
        </div>
        <div className="form-field-group">
          <label>Reply PDF (optional)</label>
          <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
        </div>
        <label className="checkbox-label">
          <input type="checkbox" checked={completed} onChange={(e) => setCompleted(e.target.checked)} />
          Mark response as completed
        </label>
      </Modal>
    </>
  );
}
