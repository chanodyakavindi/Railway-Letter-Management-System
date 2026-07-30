import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { lettersApi } from '../api';
import { useToast } from '../context/ToastContext';
import { buildLetterFormData } from '../utils/helpers';

export default function ReplyToLetter() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [letter, setLetter] = useState(null);
  const [note, setNote] = useState('');
  const [file, setFile] = useState(null);

  useEffect(() => {
    let active = true;

    const loadLetter = async () => {
      try {
        setLoading(true);
        const { data } = await lettersApi.get(id);
        if (!active) return;
        setLetter(data);
      } catch (err) {
        if (!active) return;
        showToast(err.response?.data?.message || 'Unable to load letter', 'error');
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLetter();

    return () => {
      active = false;
    };
  }, [id, showToast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSaving(true);
      const payload = buildLetterFormData({
        note: note.trim(),
        completed: 'false',
      }, file);

      await lettersApi.addReply(id, payload);
      showToast('Reply saved successfully');
      navigate('/secretary-inbox');
    } catch (err) {
      showToast(err.response?.data?.message || 'Reply failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <Header title="Reply Letter / පිළිතුරු ලිපිය" />

      <div className="content-body">
        {loading ? (
          <Loading />
        ) : (
          <div className="reply-letter-stack">
            <section className="card form-container-card">
              <div className="card-header">
                <h3>Source Letter</h3>
                <p>Review the original letter before sending the reply</p>
              </div>

              <div className="form-grid">
                <div className="form-field-group">
                  <label className="bilingual-label">
                    <span className="eng-lbl">Letter Number / ලිපි අංකය</span>
                  </label>
                  <input type="text" value={letter?.letterNumber || '-'} readOnly />
                </div>

                <div className="form-field-group">
                  <label className="bilingual-label">
                    <span className="eng-lbl">Received Date / ලිපි භාරගත් දිනය</span>
                  </label>
                  <input
                    type="text"
                    value={letter?.dateReceived ? String(letter.dateReceived).split('T')[0] : '-'}
                    readOnly
                  />
                </div>

                <div className="form-field-group field-span-full">
                  <label className="bilingual-label">
                    <span className="eng-lbl">Subject / මාතෘකාව</span>
                  </label>
                  <input type="text" value={letter?.title || location.state?.title || '-'} readOnly />
                </div>
              </div>
            </section>

            <section className="card form-container-card">
              <div className="form-header-bar">
                <div className="form-header-titles">
                  <h2>Reply Details</h2>
                  <h3>Enter the reply note and attach supporting documents</h3>
                </div>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="form-grid">
                  <div className="form-field-group">
                    <label className="bilingual-label">
                      <span className="eng-lbl">Attachment / අමුණා ඇති ගොනුව</span>
                    </label>
                    <input
                      type="file"
                      className="file-upload"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.csv"
                      onChange={(e) => setFile(e.target.files[0] || null)}
                    />
                  </div>

                  <div className="form-field-group field-span-full">
                    <label className="bilingual-label">
                      <span className="eng-lbl">Reply Note / පිළිතුරු සටහන</span>
                    </label>
                    <textarea
                      rows="8"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Type your reply here..."
                      required
                    />
                  </div>
                </div>

                <div className="form-action-footer">
                  <button type="button" className="btn btn-outline" onClick={() => navigate('/secretary-inbox')}>
                    Cancel
                  </button>
                  <div className="submit-action-buttons">
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Submitting...' : 'Submit Reply'}
                    </button>
                  </div>
                </div>
              </form>
            </section>
          </div>
        )}
      </div>
    </>
  );
}