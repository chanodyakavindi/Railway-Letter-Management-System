import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Header from '../components/Header';
import MultiSelect from '../components/MultiSelect';
import Loading from '../components/Loading';
import { lettersApi } from '../api';
import { useToast } from '../context/ToastContext';
import { buildLetterFormData } from '../utils/helpers';

/* =====================================================================
   SIGNATURE OPTIONS
   - Used in the Signature/Approval dropdown for BOTH "Add Letter"
     and "Reply to Letter" tabs.
   - To add/remove options for a specific tab, make this conditional
     on `activeTab`.
   ===================================================================== */
const SIGNATURE_OPTIONS = [
  'Approved & Signed',
  'Pending Approval',
  'Instructions Forwarded',
  'Re-Route Required',
];

export default function AddLetterFullPage() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const replyId = params.get("reply");
  const editId = params.get('edit');
  const replyFromId = params.get('replyFrom');
  const initialTab = params.get('tab') === 'reply' ? 'reply' : 'add';
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(!!editId);
  const [saving, setSaving] = useState(false);

  /* ===================================================================
     ACTIVE TAB STATE
     - "add"   → Shows the "Add Letter" form
     - "reply" → Shows the "Reply to Letter" form
     - Each tab has its own independent form state.
     - To customize fields per tab, wrap them in:
         {activeTab === "add" && ( ... )}
         {activeTab === "reply" && ( ... )}
     =================================================================== */
  const [activeTab, setActiveTab] = useState(initialTab);
  const [replySource, setReplySource] = useState(null);

  const [incomingFile, setIncomingFile] = useState(null);
  const [incomingScanFile, setIncomingScanFile] = useState(null);
  const [replyFile, setReplyFile] = useState(null);
  const [replyScanFile, setReplyScanFile] = useState(null);

  /* ===================================================================
     FORM STATE (SEPARATE PARTS)
     - Part A captures incoming letter registration details.
     - Part B captures reply/outgoing letter details and is optional.
     =================================================================== */
  // ================================
// ADD LETTER FORM STATE
// ================================
const [incomingForm, setIncomingForm] = useState({
    dateReceived: new Date().toISOString().split('T')[0],
    referredEntity: '',
    letterNumber: '',
    letterDate: '',
    title: '',
    fileNumber: '',
});



// ================================
// REPLY LETTER FORM STATE
// ================================
const [replyForm, setReplyForm] = useState({
    actionTaken: '',
    signatureStatus: '',
    presentedTo: '',
    dateFileTransferred: '',
    dateFileReceived: '',
    dateOfSignature: '',
    dateOfMailing: '',
    sendTo: [],
    sendCopiesTo: [],
    reminderDate: '',
    customRecipientName: '',
});

  /* ===================================================================
     FETCH CATEGORIES (used by Send To / Send Copies To dropdowns)
     =================================================================== */
  useEffect(() => {
    lettersApi.categories().then(({ data }) => setCategories(data));
  }, []);
 
  useEffect(() => {
    if (initialTab === 'reply') {
      setActiveTab('reply');
    }
  }, [initialTab]);

  // NEW CHANGE: Load original letter details when Reply button is clicked
useEffect(() => {

  if (!replyId) return;


  const loadReplyLetter = async () => {

    try {

      const { data } = await lettersApi.get(replyId);


      // NEW CHANGE: Switch automatically to Reply tab
      setActiveTab("reply");


      // NEW CHANGE: Store original letter details for display
      setReplySource(data);


      // NEW CHANGE: Fill reply-related fields from original letter
      setReplyForm((prev)=>({

        ...prev,

        presentedTo: data.referredEntity || "",

        sendTo: data.sendTo || [],

        sendCopiesTo: data.sendCopiesTo || [],

        dateFileReceived:
          data.dateReceived?.split("T")[0] || "",

      }));


      // NEW CHANGE: Fill incoming form data because reply depends on original letter
      setIncomingForm({

        dateReceived:
          data.dateReceived?.split("T")[0] || "",

        referredEntity:
          data.referredEntity || "",

        letterNumber:
          data.letterNumber || "",

        letterDate:
          data.letterDate?.split("T")[0] || "",

        title:
          data.title || "",

        fileNumber:
          data.fileNumber || "",

      });


    } catch(err){

      console.error(err);

    }

  };


  loadReplyLetter();


},[replyId]);
  useEffect(() => {
    if (!replyFromId) {
      setReplySource(null);
      return;
    }

    setLoading(true);
    lettersApi.get(replyFromId)
      .then(({ data }) => {
        setReplySource(data);
        setActiveTab('reply');
        setIncomingForm({
          dateReceived: data.dateReceived?.split('T')[0] || new Date().toISOString().split('T')[0],
          referredEntity: data.referredEntity || '',
          letterNumber: data.letterNumber || '',
          letterDate: data.letterDate?.split('T')[0] || '',
          title: data.title || '',
          fileNumber: data.fileNumber || '',
        });
        setReplyForm((prev) => ({
          ...prev,
          actionTaken: prev.actionTaken || `Reply to ${data.letterId}`,
          presentedTo: data.referredEntity || '',
          dateFileReceived: data.dateReceived?.split('T')[0] || '',
          sendTo: data.sendTo || [],
          sendCopiesTo: data.sendCopiesTo || [],
          customRecipientName: data.customRecipientName || '',
          reminderDate: data.reminderDate?.split('T')[0] || '',
        }));
      })
      .finally(() => setLoading(false));
  }, [replyFromId]);

  /* ===================================================================
     LOAD EXISTING LETTER FOR EDITING
     - Only runs when `editId` is present in URL params.
     - Populates the shared form state.
     =================================================================== */
  useEffect(() => {
    if (!editId) {
      setLoading(false);
      return;
    }
    lettersApi.get(editId)
      .then(({ data }) => {
        setIncomingForm({
          dateReceived: data.dateReceived?.split('T')[0] || '',
          referredEntity: data.referredEntity || '',
          letterNumber: data.letterNumber || '',
          letterDate: data.letterDate?.split('T')[0] || '',
          title: data.title || '',
          fileNumber: data.fileNumber || '',
          dateOfFiling: data.dateOfFiling?.split('T')[0] || '',
        });
        setReplyForm({
          actionTaken: data.actionTaken || '',
          signatureStatus: data.signatureStatus || '',
          presentedTo: data.presentedTo || '',
          dateFileTransferred: data.dateFileTransferred?.split('T')[0] || '',
          dateFileReceived: data.dateFileReceived?.split('T')[0] || '',
          dateOfSignature: data.dateOfSignature?.split('T')[0] || '',
          dateOfMailing: data.dateOfMailing?.split('T')[0] || '',
          sendTo: data.sendTo || [],
          sendCopiesTo: data.sendCopiesTo || [],
          reminderDate: data.reminderDate?.split('T')[0] || '',
          customRecipientName: data.customRecipientName || '',
        });
      })
      .finally(() => setLoading(false));
  }, [editId]);

  /* ===================================================================
     FORM FIELD UPDATER
     - Helper to update a single field in the shared form state.
     - Auto-updates reminderDate when dateReceived changes (new entries).
     =================================================================== */
  const setIncoming = (key, value) => {
    setIncomingForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const setReply = (key, value) => {
    setReplyForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  /* ===================================================================
     SAVE HANDLER (SHARED BY BOTH TABS)
     - Saves the letter as Draft or Completed.
     - Currently identical for both tabs. To differentiate behavior
       per tab, check `activeTab` inside this function.
     - Example:
         if (activeTab === "reply") {
           payload.isReply = true;
           // add reply-specific fields
         }
     =================================================================== */
  const save = async (asDraft) => {
    if (!asDraft && activeTab === 'add') {
      if (!incomingForm.dateReceived || !incomingForm.referredEntity || !incomingForm.letterNumber || !incomingForm.title) {
        showToast('Date Received, Referring Organization, Letter Number and Subject are required', 'error');
        return;
      }
    }

    setSaving(true);
    try {
      let payload;
      if (activeTab === 'add') {
        payload = { ...incomingForm, status: asDraft ? 'Draft' : 'Completed', sourceType: 'letter' };
      } else {
        const today = new Date().toISOString().split('T')[0];
        const fallbackTitle = replySource?.title || (replyForm.actionTaken || '').trim() || 'Reply Letter';
        payload = {
          ...replyForm,
          // /api/letters create requires title + dateReceived.
          // Keep reply mode compatible by providing sensible defaults.
          title: fallbackTitle,
          dateReceived: incomingForm.dateReceived || replySource?.dateReceived?.split('T')[0] || today,
          referredEntity: replySource?.referredEntity || incomingForm.referredEntity || '',
          letterNumber: replySource?.letterNumber || incomingForm.letterNumber || '',
          letterDate: replySource?.letterDate?.split('T')[0] || incomingForm.letterDate || '',
          fileNumber: replySource?.fileNumber || incomingForm.fileNumber || '',
          // Reply-flow items must stay pending until user explicitly completes from Reminders.
          status: 'Pending',
          sourceType: 'reply',
        };
      }
      const fileToUpload = activeTab === 'reply' ? (replyScanFile || replyFile) : (incomingScanFile || incomingFile);
      const fd = buildLetterFormData(payload, fileToUpload);
      if (editId) {
        await lettersApi.update(editId, fd);
        showToast('Letter updated');
      } else {
        await lettersApi.create(fd);

        if (activeTab === 'reply' && !asDraft && replySource?._id) {
          await lettersApi.updateStatus(replySource._id, { status: 'Completed' });
        }

        showToast(asDraft ? 'Draft saved' : 'Letter registered');
      }
      navigate('/letters');
    } catch (err) {
      showToast(err.response?.data?.message || 'Save failed', 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ===================================================================
     LOADING STATE
     - Shows while fetching an existing letter for editing.
     - Header title changes based on `activeTab`.
     =================================================================== */
  if (loading) {
    return (
      <>
        {/* HEADER — changes title based on active tab */}
        <Header
          title={
            activeTab === "add"
              ? "Add Letter / ලිපියක් එක් කරන්න"
              : "Reply to Letter / පිළිතුරු ලිපිය"
          }
        />
        <div className="content-body"><Loading /></div>
      </>
    );
  }

  const showOther = (replyForm.sendTo || []).includes('Other') || (replyForm.sendCopiesTo || []).includes('Other');

  return (
    <>
      {/* =============================================================
          PAGE HEADER
          - Title changes based on active tab ("Add Letter" vs "Reply to Letter")
          - CHANGE HERE: Modify titles for each tab mode
          ============================================================= */}
      <Header
        title={
          activeTab === "add"
            ? "Add Letter / ලිපියක් එක් කරන්න"
            : "Reply to Letter / පිළිතුරු ලිපිය"
        }
      />

      <div className="content-body">

        {/* =============================================================
            TAB SWITCHER — "Add Letter" / "Reply to Letter"
            - Clicking a tab sets `activeTab` state to "add" or "reply"
            - The active tab gets the "active" CSS class for styling
            - CHANGE HERE: To add more tabs, add another <button> and
              update the `activeTab` state values accordingly
            ============================================================= */}
        <div className="letter-tabs">
          {/* --- ADD LETTER TAB BUTTON --- */}
          <button
            className={`letter-tab ${activeTab === "add" ? "active" : ""}`}
            onClick={() => setActiveTab("add")}
          >
            Add Letter
          </button>

          {/* --- REPLY TO LETTER TAB BUTTON --- */}
          <button
            className={`letter-tab ${activeTab === "reply" ? "active" : ""}`}
            onClick={() => setActiveTab("reply")}
          >
            Reply to Letter
          </button>
        </div>

        {/* =============================================================
            FORM CARD — Contains all form fields
            - Currently the same fields are shown for BOTH tabs.
            - To show/hide fields per tab, wrap them in:
                {activeTab === "add" && ( <div>...</div> )}
                {activeTab === "reply" && ( <div>...</div> )}
            ============================================================= */}
        <div className="card form-container-card">

          {/* -----------------------------------------------------------
              FORM HEADER BAR
              - Displays the Sinhala + English form title
              - Shows "Edit Entry" or "New Entry" indicator
              - CHANGE HERE: Titles change based on activeTab
              ----------------------------------------------------------- */}
          <div className="form-header-bar">
            <div className="form-header-titles">
              {/* TAB-SPECIFIC TITLES */}
              {activeTab === "add" ? (
                <>
                  {/* ADD LETTER — Form heading (Sinhala + English) */}
                  <h2>ලිපි ලියාපදිංචි කිරීමේ ආකෘතිය</h2>
                  <h3>Register Incoming Letter Form</h3>
                </>
              ) : (
                <>
                  {/* REPLY TO LETTER — Form heading (Sinhala + English) */}
                  <h2>පිළිතුරු ලිපි ආකෘතිය</h2>
                  <h3>Reply Letter Form</h3>
                </>
              )}
            </div>
            <span className="form-edit-indicator">

{
    editId
        ? "Edit Entry"
        : activeTab === "add"
        ? "New Letter"
        : "New Reply"
}

</span>
          </div>

          {/* -----------------------------------------------------------
              FORM FIELDS GRID
              - Part A is the incoming letter form.
              - Part B is the reply/outgoing letter form.
              - They use separate state objects and do not share values.
              ----------------------------------------------------------- */}
          {activeTab === 'add' ? (
            <div className="form-grid">
              <div className="form-field-group">
                <label className="bilingual-label"><span className="eng-lbl">Date Received *</span></label>
                <input type="date" value={incomingForm.dateReceived} onChange={(e) => setIncoming('dateReceived', e.target.value)} required />
              </div>

              <div className="form-field-group">
                <label className="bilingual-label"><span className="eng-lbl">Referring Organization / Institution *</span></label>
                <input type="text" value={incomingForm.referredEntity} onChange={(e) => setIncoming('referredEntity', e.target.value)} required />
              </div>

              <div className="form-field-group">
                <label className="bilingual-label"><span className="eng-lbl">Letter Number *</span></label>
                <input type="text" value={incomingForm.letterNumber} onChange={(e) => setIncoming('letterNumber', e.target.value)} required />
              </div>

              <div className="form-field-group">
                <label className="bilingual-label"><span className="eng-lbl">Subject of the Letter *</span></label>
                <input type="text" value={incomingForm.title} onChange={(e) => setIncoming('title', e.target.value)} required />
              </div>

              <div className="form-field-group">
                <label className="bilingual-label"><span className="eng-lbl">File Number</span></label>
                <input type="text" value={incomingForm.fileNumber} onChange={(e) => setIncoming('fileNumber', e.target.value)} />
              </div>

              <div className="form-field-group field-span-full">
                <label className="bilingual-label"><span className="eng-lbl">Document Upload</span></label>
                <div className="file-uploader-box">
                  <input type="file" accpt=".pdf,.doc,.docx,.xls,.xlsx,.csv" onChange={(e) => setIncomingFile(e.target.files[0])} />
                  <label htmlFor="file" style={{fontSize: "14px",fontWeight: "600",color: "#333",marginBottom: "8px",display: "block"}}>Upload PDF</label>
                  {incomingFile && <span className="pdf-name">{incomingFile.name}</span>}
                </div>
              </div>

              {/* <div className="form-field-group field-span-full">
                <label className="bilingual-label"><span className="eng-lbl">Scan Upload</span></label>
                <div className="file-uploader-box">
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif" onChange={(e) => setIncomingScanFile(e.target.files[0])} />
                  {incomingScanFile && <span className="pdf-name">{incomingScanFile.name}</span>}
                </div>
              </div> */}
            </div>
          ) : (
            <>
              {replySource && (
                <div className="card" style={{ marginBottom: 16 }}>
                  <div className="card-header">
                    <h3>Reply Source Letter</h3>
                    <span>{replySource.letterId}</span>
                  </div>
                  <div className="modal-bilingual-split-grid">
                    <div className="meta-field">
                      <span className="meta-label">Date Received / ලිපි භාරගත් දිනය</span>
                      <div className="meta-val">{replySource.dateReceived?.split('T')[0] || '-'}</div>
                    </div>
                    <div className="meta-field">
                      <span className="meta-label">Referring Organization / ආයතනය</span>
                      <div className="meta-val">{replySource.referredEntity || '-'}</div>
                    </div>
                    <div className="meta-field">
                      <span className="meta-label">Letter Number / ලිපි අංකය</span>
                      <div className="meta-val">{replySource.letterNumber || '-'}</div>
                    </div>
                    <div className="meta-field">
                      <span className="meta-label">File Number / ගොනු අංකය</span>
                      <div className="meta-val">{replySource.fileNumber || '-'}</div>
                    </div>
                    <div className="meta-field field-span-full">
                      <span className="meta-label">Subject / මාතෘකාව</span>
                      <div className="meta-val highlight-box">{replySource.title || '-'}</div>
                    </div>
                    <div className="meta-field">
                      <span className="meta-label">Send To / ඉදිරිපත් කළේ</span>
                      <div className="pills-list-inline">
                        {(replySource.sendTo || []).map((s) => <span key={s} className="inline-badge">{s}</span>)}
                      </div>
                    </div>
                    <div className="meta-field">
                      <span className="meta-label">Copies / පිටපත්</span>
                      <div className="pills-list-inline">
                        {(replySource.sendCopiesTo || []).map((s) => <span key={s} className="inline-badge">{s}</span>)}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            <div className="form-grid">
              <div className="form-field-group field-span-full">
                <label className="bilingual-label"><span className="eng-lbl">Action Taken on the Letter</span></label>
                <textarea rows={2} value={replyForm.actionTaken} onChange={(e) => setReply('actionTaken', e.target.value)} />
              </div>

              <div className="form-field-group">
                <label className="bilingual-label"><span className="eng-lbl">Signature / Approval / Instructions</span></label>
                <select value={replyForm.signatureStatus} onChange={(e) => setReply('signatureStatus', e.target.value)}>
                  <option value="">-- Select --</option>
                  {SIGNATURE_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className="form-field-group">
                <label className="bilingual-label"><span className="eng-lbl">Date File Forwarded</span></label>
                <input type="date" value={replyForm.dateFileTransferred} onChange={(e) => setReply('dateFileTransferred', e.target.value)} />
              </div>

              <div className="form-field-group">
                <label className="bilingual-label"><span className="eng-lbl">Date File Received</span></label>
                <input type="date" value={replyForm.dateFileReceived} onChange={(e) => setReply('dateFileReceived', e.target.value)} />
              </div>

              <div className="form-field-group">
                <label className="bilingual-label"><span className="eng-lbl">Date Signed (Letter Date)</span></label>
                <input type="date" value={replyForm.dateOfSignature} onChange={(e) => setReply('dateOfSignature', e.target.value)} />
              </div>

              <div className="form-field-group">
                <label className="bilingual-label"><span className="eng-lbl">Date Mailed / Posted</span></label>
                <input type="date" value={replyForm.dateOfMailing} onChange={(e) => setReply('dateOfMailing', e.target.value)} />
              </div>

              <div className="form-field-group field-span-half">
                <label className="bilingual-label"><span className="eng-lbl">Submitted By / Send By</span></label>
                <MultiSelect
                  options={categories.map((c) => ({ value: c.value, label: c.label }))}
                  value={replyForm.sendTo}
                  onChange={(v) => setReply('sendTo', v)}
                  placeholder="Selected roles"
                />
              </div>

              <div className="form-field-group field-span-half">
                <label className="bilingual-label"><span className="eng-lbl">Send By Copies</span></label>
                <MultiSelect
                  options={categories.map((c) => ({ value: c.value, label: c.label }))}
                  value={replyForm.sendCopiesTo}
                  onChange={(v) => setReply('sendCopiesTo', v)}
                  placeholder="Selected roles"
                />
              </div>

              {showOther && (
                <div className="form-field-group field-span-full">
                  <label className="bilingual-label"><span className="eng-lbl">Other Recipient Name</span></label>
                  <input type="text" value={replyForm.customRecipientName} onChange={(e) => setReply('customRecipientName', e.target.value)} />
                </div>
              )}

              <div className="form-field-group">
                <label className="bilingual-label"><span className="eng-lbl">Reminder Date</span></label>
                <input type="date" value={replyForm.reminderDate} onChange={(e) => setReply('reminderDate', e.target.value)} />
              </div>

              <div className="form-field-group field-span-full">
                <label className="bilingual-label"><span className="eng-lbl">Document Upload</span></label>
                <div className="file-uploader-box">
                  <input type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv" onChange={(e) => setReplyFile(e.target.files[0])} />
                  <label htmlFor="file-uploader-box" style={{fontSize:"14px", fontWeight:"600",color: "#333",marginBottom: "8px",display: "block"}}>Upload PDF</label>
                  {replyFile && <span className="pdf-name">{replyFile.name}</span>}
                </div>
              </div>

              {/* <div className="form-field-group field-span-full">
                <label className="bilingual-label"><span className="eng-lbl">Scan Upload</span></label>
                <div className="file-uploader-box">
                  <input type="file" accept=".pdf,.png,.jpg,.jpeg,.webp,.gif" onChange={(e) => setReplyScanFile(e.target.files[0])} />
                  {replyScanFile && <span className="pdf-name">{replyScanFile.name}</span>}
                </div>
              </div> */}
            </div>
            </>
          )}

          {/* -----------------------------------------------------------
              FORM ACTION FOOTER (SHARED BY BOTH TABS)
              - Cancel, Save Draft, and Complete buttons
              - To customize button text or behavior per tab, check
                `activeTab` here. Example:
                  <button onClick={() => save(false)}>
                    {activeTab === "reply" ? "Send Reply" : "Complete"}
                  </button>
              ----------------------------------------------------------- */}
          <div className="form-action-footer">
            <button type="button" className="btn btn-outline" onClick={() => navigate('/letters')}>Cancel</button>
            <div className="submit-action-buttons">
              <button type="button" className="btn btn-secondary" disabled={saving} onClick={() => save(true)}>Draft Stage</button>
              <button type="button" className="btn btn-primary" disabled={saving} onClick={() => save(false)}>Submit & Register</button>
            </div>
          </div>

        </div>
        {/* --- END FORM CARD --- */}

      </div>
    </>
  );
}
