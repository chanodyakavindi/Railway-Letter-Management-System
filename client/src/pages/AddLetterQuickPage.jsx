import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import MultiSelect from '../components/MultiSelect';
import { lettersApi } from '../api';
import { useToast } from '../context/ToastContext';
import { buildLetterFormData, defaultReminderDate } from '../utils/helpers';

export default function AddLetterQuickPage() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [saving, setSaving] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [form, setForm] = useState({
    dateReceived: new Date().toISOString().split('T')[0],
    referredEntity: '',
    letterNumber: '',
    letterDate: '',
    title: '',
    sendTo: [],
    sendCopiesTo: [],
    customRecipientName: '',
    reminderDate: defaultReminderDate(new Date()),
    entryType: 'quick',
    status: 'Draft',
  });

  useEffect(() => {
    lettersApi.categories().then(({ data }) => setCategories(data));
  }, []);

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const save = async (asDraft) => {
    if (!form.title && !form.letterNumber) {
      showToast('Please enter letter number or subject', 'error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        title: form.title || `Letter ${form.letterNumber}`,
        status: asDraft ? 'Draft' : 'Completed',
      };
      const fd = buildLetterFormData(payload, pdfFile);
      await lettersApi.create(fd);
      showToast(asDraft ? 'Draft saved' : 'Letter registered');
      navigate('/letters');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  const filterOptions = categories.filter((c) =>
    ['GMR', 'Secretary', 'Additional Directors', 'All'].includes(c.value) ||
    !['PSC', 'PUBAD', 'Pension Department', 'DMS'].includes(c.value)
  );

  return (
    <>
      <Header title="Add Letter Option 2 / දෙවන ක්‍රමය" />
      <div className="content-body">
        <div className="card form-container-card">
          <div className="form-header-bar">
            <div className="form-header-titles">
              <h2>ලිපියක් එක් කරන්න - දෙවන ක්‍රමය</h2>
              <h3>Quick Entry / Scan / PDF Upload</h3>
            </div>
          </div>

          <div className="form-grid">
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Date Received *</span></label>
              <input type="date" value={form.dateReceived} onChange={(e) => set('dateReceived', e.target.value)} />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Name / Referred Entity *</span></label>
              <input type="text" value={form.referredEntity} onChange={(e) => set('referredEntity', e.target.value)} />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Letter Number *</span></label>
              <input type="text" value={form.letterNumber} onChange={(e) => set('letterNumber', e.target.value)} />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Letter Date</span></label>
              <input type="date" value={form.letterDate} onChange={(e) => set('letterDate', e.target.value)} />
            </div>
            <div className="form-field-group field-span-full">
              <label className="bilingual-label"><span className="eng-lbl">Subject</span></label>
              <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} placeholder="Optional if PDF uploaded" />
            </div>
            <div className="form-field-group field-span-full">
              <label className="bilingual-label"><span className="eng-lbl">Scan / PDF Upload</span></label>
              <div className="uploader-drag-zone">
                <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
                {pdfFile ? (
                  <div className="attached-pdf-badge">
                    <span className="pdf-name">{pdfFile.name}</span>
                    <a href={URL.createObjectURL(pdfFile)} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm">Preview</a>
                  </div>
                ) : (
                  <p>Upload PDF (max 10MB). Fill fields manually after upload.</p>
                )}
              </div>
            </div>
            <div className="form-field-group field-span-full">
              <label className="bilingual-label"><span className="eng-lbl">Send To *</span></label>
              <MultiSelect
                options={filterOptions.map((c) => ({ value: c.value, label: c.label }))}
                value={form.sendTo}
                onChange={(v) => set('sendTo', v)}
                placeholder="Select recipients"
              />
            </div>
            <div className="form-field-group field-span-full">
              <label className="bilingual-label"><span className="eng-lbl">Send Copies To</span></label>
              <MultiSelect
                options={categories.map((c) => ({ value: c.value, label: c.label }))}
                value={form.sendCopiesTo}
                onChange={(v) => set('sendCopiesTo', v)}
                placeholder="Select CC"
              />
            </div>
            {(form.sendTo.includes('Other') || form.sendCopiesTo.includes('Other')) && (
              <div className="form-field-group field-span-full">
                <label className="bilingual-label"><span className="eng-lbl">Custom Recipient Name</span></label>
                <input type="text" value={form.customRecipientName} onChange={(e) => set('customRecipientName', e.target.value)} />
              </div>
            )}
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Reminder Date</span></label>
              <input type="date" value={form.reminderDate} onChange={(e) => set('reminderDate', e.target.value)} />
            </div>
          </div>

          <div className="form-action-footer">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/letters')}>Cancel</button>
            <div className="submit-action-buttons">
              <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => save(true)}>Save Draft</button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={() => save(false)}>Complete</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
