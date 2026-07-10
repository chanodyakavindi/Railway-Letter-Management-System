import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import MultiSelect from '../components/MultiSelect';
import Loading from '../components/Loading';
import { lettersApi } from '../api';
import { useToast } from '../context/ToastContext';
import { buildLetterFormData, defaultReminderDate } from '../utils/helpers';

const SIGNATURE_OPTIONS = [
  'Approved & Signed',
  'Pending Approval',
  'Instructions Forwarded',
  'Re-Route Required',
];

export default function AddLetterFullPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const editId = params.get('edit');
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);
  const [pdfFile, setPdfFile] = useState(null);
  const [form, setForm] = useState({
    dateReceived: new Date().toISOString().split('T')[0],
    referredEntity: '',
    letterNumber: '',
    letterDate: '',
    title: '',
    fileNumber: '',
    actionTaken: '',
    signatureStatus: '',
    presentedTo: '',
    dateFileTransferred: '',
    dateOfFiling: '',
    dateOfSignature: '',
    dateOfMailing: '',
    sendTo: [],
    sendCopiesTo: [],
    customRecipientName: '',
    status: 'Draft',
    reminderDate: '',
    entryType: 'full',
  });

  useEffect(() => {
    lettersApi.categories().then(({ data }) => setCategories(data));
  }, []);

  useEffect(() => {
    if (!editId) {
      setForm((f) => ({ ...f, reminderDate: defaultReminderDate(f.dateReceived) }));
      return;
    }
    lettersApi.get(editId)
      .then(({ data }) => {
        setForm({
          dateReceived: data.dateReceived?.split('T')[0] || '',
          referredEntity: data.referredEntity || '',
          letterNumber: data.letterNumber || '',
          letterDate: data.letterDate?.split('T')[0] || '',
          title: data.title || '',
          fileNumber: data.fileNumber || '',
          actionTaken: data.actionTaken || '',
          signatureStatus: data.signatureStatus || '',
          presentedTo: data.presentedTo || '',
          dateFileTransferred: data.dateFileTransferred?.split('T')[0] || '',
          dateOfFiling: data.dateOfFiling?.split('T')[0] || '',
          dateOfSignature: data.dateOfSignature?.split('T')[0] || '',
          dateOfMailing: data.dateOfMailing?.split('T')[0] || '',
          sendTo: data.sendTo || [],
          sendCopiesTo: data.sendCopiesTo || [],
          customRecipientName: data.customRecipientName || '',
          status: data.status || 'Draft',
          reminderDate: data.reminderDate?.split('T')[0] || '',
          entryType: 'full',
        });
      })
      .finally(() => setLoading(false));
  }, [editId]);

  const set = (key, val) => setForm((f) => {
    const next = { ...f, [key]: val };
    if (key === 'dateReceived' && !editId) {
      next.reminderDate = defaultReminderDate(val);
    }
    return next;
  });

  const save = async (asDraft) => {
    setSaving(true);
    try {
      const payload = { ...form, status: asDraft ? 'Draft' : 'Completed' };
      const fd = buildLetterFormData(payload, pdfFile);
      if (editId) {
        await lettersApi.update(editId, fd);
        showToast('Letter updated');
      } else {
        await lettersApi.create(fd);
        showToast(asDraft ? 'Draft saved' : 'Letter registered');
      }
      navigate('/letters');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <Header title="Add Letter / ලිපියක් එක් කරන්න" />
        <div className="content-body"><Loading /></div>
      </>
    );
  }

  const showOther = form.sendTo.includes('Other') || form.sendCopiesTo.includes('Other');

  return (
    <>
      <Header title="Add Letter / ලිපියක් එක් කරන්න" />
      <div className="content-body">
        <div className="card form-container-card">
          <div className="form-header-bar">
            <div className="form-header-titles">
              <h2>ලිපි ලියාපදිංචි කිරීමේ ආකෘතිය</h2>
              <h3>Register Incoming Letter Form</h3>
            </div>
            <span className="form-edit-indicator">{editId ? 'Edit Entry' : 'New Entry / නව ඇතුළත් කිරීම'}</span>
          </div>

          <div className="form-grid">
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Date Received *</span></label>
              <input type="date" value={form.dateReceived} onChange={(e) => set('dateReceived', e.target.value)} required />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Referring Organization *</span></label>
              <input type="text" value={form.referredEntity} onChange={(e) => set('referredEntity', e.target.value)} required />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Letter Number *</span></label>
              <input type="text" value={form.letterNumber} onChange={(e) => set('letterNumber', e.target.value)} required />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Letter Date</span></label>
              <input type="date" value={form.letterDate} onChange={(e) => set('letterDate', e.target.value)} />
            </div>
            <div className="form-field-group field-span-full">
              <label className="bilingual-label"><span className="eng-lbl">Subject *</span></label>
              <input type="text" value={form.title} onChange={(e) => set('title', e.target.value)} required />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">File Number</span></label>
              <input type="text" value={form.fileNumber} onChange={(e) => set('fileNumber', e.target.value)} />
            </div>
            <div className="form-field-group field-span-full">
              <label className="bilingual-label"><span className="eng-lbl">Action Taken</span></label>
              <textarea rows={2} value={form.actionTaken} onChange={(e) => set('actionTaken', e.target.value)} />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Signature / Approval</span></label>
              <select value={form.signatureStatus} onChange={(e) => set('signatureStatus', e.target.value)}>
                <option value="">-- Select --</option>
                {SIGNATURE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Presented To</span></label>
              <input type="text" value={form.presentedTo} onChange={(e) => set('presentedTo', e.target.value)} />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Date File Transferred</span></label>
              <input type="date" value={form.dateFileTransferred} onChange={(e) => set('dateFileTransferred', e.target.value)} />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Date of Filing</span></label>
              <input type="date" value={form.dateOfFiling} onChange={(e) => set('dateOfFiling', e.target.value)} />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Date of Signature</span></label>
              <input type="date" value={form.dateOfSignature} onChange={(e) => set('dateOfSignature', e.target.value)} />
            </div>
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Date of Mailing</span></label>
              <input type="date" value={form.dateOfMailing} onChange={(e) => set('dateOfMailing', e.target.value)} />
            </div>
            <div className="form-field-group field-span-half">
              <label className="bilingual-label"><span className="eng-lbl">Send To *</span></label>
              <MultiSelect
                options={categories.map((c) => ({ value: c.value, label: c.label }))}
                value={form.sendTo}
                onChange={(v) => set('sendTo', v)}
                placeholder="Select channels"
              />
            </div>
            <div className="form-field-group field-span-half">
              <label className="bilingual-label"><span className="eng-lbl">Send Copies To</span></label>
              <MultiSelect
                options={categories.map((c) => ({ value: c.value, label: c.label }))}
                value={form.sendCopiesTo}
                onChange={(v) => set('sendCopiesTo', v)}
                placeholder="Select CC channels"
              />
            </div>
            {showOther && (
              <div className="form-field-group field-span-full">
                <label className="bilingual-label"><span className="eng-lbl">Other Recipient Name *</span></label>
                <input type="text" value={form.customRecipientName} onChange={(e) => set('customRecipientName', e.target.value)} />
              </div>
            )}
            <div className="form-field-group">
              <label className="bilingual-label"><span className="eng-lbl">Reminder Date</span></label>
              <input type="date" value={form.reminderDate} onChange={(e) => set('reminderDate', e.target.value)} />
            </div>
            <div className="form-field-group field-span-full">
              <label className="bilingual-label"><span className="eng-lbl">PDF Upload</span></label>
              <div className="file-uploader-box">
                <input type="file" accept="application/pdf" onChange={(e) => setPdfFile(e.target.files[0])} />
                {pdfFile && <span className="pdf-name">{pdfFile.name}</span>}
              </div>
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
