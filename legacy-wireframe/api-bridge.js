/* ==========================================================================
   RLMS API BRIDGE
   Wires the original static wireframe (app.js) to the live Express + MongoDB
   backend. Loaded AFTER app.js so it overrides the localStorage/demo logic
   with real REST API calls. The UI rendering code in app.js is untouched.
   ========================================================================== */

(function () {
  const API = '/api';
  const TOKEN_KEY = 'rlms_token';

  // --- Token helpers ---
  const getToken = () => localStorage.getItem(TOKEN_KEY);
  const setToken = (t) => localStorage.setItem(TOKEN_KEY, t);
  const clearTokenStore = () => localStorage.removeItem(TOKEN_KEY);

  // --- Core fetch wrapper ---
  async function apiFetch(path, opts = {}) {
    const headers = Object.assign({}, opts.headers || {});
    const token = getToken();
    if (token) headers.Authorization = 'Bearer ' + token;

    const fetchOpts = { method: opts.method || 'GET', headers };
    if (opts.json !== undefined) {
      headers['Content-Type'] = 'application/json';
      fetchOpts.body = JSON.stringify(opts.json);
    } else if (opts.body !== undefined) {
      fetchOpts.body = opts.body; // FormData
    }

    const res = await fetch(API + path, fetchOpts);
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch (e) { data = text; }

    if (!res.ok) {
      const msg = (data && data.message) || ('Request failed (' + res.status + ')');
      throw new Error(msg);
    }
    return data;
  }

  // --- Date helper: ISO -> yyyy-mm-dd ---
  function dateOnly(d) {
    if (!d) return '';
    const dt = new Date(d);
    if (isNaN(dt.getTime())) return '';
    return dt.toISOString().split('T')[0];
  }

  // ========================================================================
  // FIELD ADAPTER: backend Letter  ->  legacy wireframe letter shape
  // ========================================================================
  function apiToLocal(l) {
    const createdByName = l.createdBy
      ? `${l.createdBy.fullName} (${l.createdBy.employeeId || l.createdBy.username})`
      : '';

    const lnum = l.letterNumber || '';
    const ldate = dateOnly(l.letterDate);
    const letterNumDate = [lnum, ldate].filter(Boolean).join(' - ');

    return {
      _id: l._id,
      id: l.letterId,
      dateReceived: dateOnly(l.dateReceived),
      referringOrg: l.referredEntity || '',
      letterNumDate: letterNumDate,
      subject: l.title || '',
      fileNumber: l.fileNumber || '',
      actionTaken: l.actionTaken || '',
      signatureDropdown: l.signatureStatus || '',
      submittedTo: l.presentedTo || '',
      dateForwarded: dateOnly(l.dateFileTransferred),
      dateFileReceived: dateOnly(l.dateOfFiling),
      dateSigned: dateOnly(l.dateOfSignature),
      dateMailed: dateOnly(l.dateOfMailing),
      sendTo: l.sendTo || [],
      sendCopies: l.sendCopiesTo || [],
      stage: l.status === 'Completed' ? 'Completed' : 'Draft',
      status: l.status,
      reminderDate: dateOnly(l.reminderDate),
      reminders: (l.reminderHistory || [])
        .filter((r) => r.reminderDate)
        .map((r, i) => ({
          number: (typeof getReminderNumberStr === 'function') ? getReminderNumberStr(i) : (i + 1) + '',
          date: dateOnly(r.reminderDate),
          addedBy: 'Officer',
          notes: r.notes || '',
          timestamp: r.changedAt,
        })),
      noActionHistory: l.status === 'NoAction'
        ? [{ marked: true, dateMarked: dateOnly(l.noActionDate), reason: l.noActionRemarks || '', addedBy: '', timestamp: l.updatedAt }]
        : [],
      isNoActionTaken: l.status === 'NoAction',
      noActionDate: dateOnly(l.noActionDate),
      noActionReason: l.noActionRemarks || '',
      pdfName: (l.pdfAttachment && l.pdfAttachment.originalName) || '',
      pdfAttachmentId: (l.pdfAttachment && l.pdfAttachment.filename) ? 'main' : '',
      createdBy: createdByName,
      replies: (l.replies || []).map((r) => ({
        sender: r.user ? r.user.fullName : 'User',
        designation: r.user ? (r.user.designation || '') : '',
        text: r.note || '',
        date: dateOnly(r.createdAt),
        pdfName: r.attachment ? r.attachment.originalName : '',
        attachmentId: r.attachment && r.attachment._id ? String(r.attachment._id) : '',
      })),
      logs: [],
      customRecipientName: l.customRecipientName || '',
    };
  }

  // --- Build the legacy currentUser object from a backend user ---
  function buildCurrentUser(u) {
    let permissions = [];
    if (u.role === 'officer') permissions = ['create_letter', 'edit_letter', 'view_all', 'view_dashboard'];
    else if (u.role === 'head') permissions = ['view_all', 'view_dashboard'];
    else if (u.role === 'secretary') permissions = ['view_assigned', 'reply_letter'];
    else if (u.role === 'admin') permissions = ['manage_users'];

    return {
      _id: u._id,
      id: u.employeeId || u.username,
      username: u.username,
      name: u.fullName,
      designation: u.designation || u.role,
      role: u.role,
      permissions: permissions,
      category: u.secretaryCategory || null,
    };
  }

  // --- Find the mongo _id of a letter from its display id (RLY-...) ---
  function findMongoId(displayId) {
    const match = (lettersDatabase || []).find((l) => l.id === displayId);
    return match ? match._id : null;
  }

  // --- Upload helpers: PDF, Word, Excel, CSV, images, text ---
  const ALLOWED_EXT_RE = /\.(pdf|png|jpe?g|webp|gif|docx?|xlsx?|csv|txt)$/i;
  const AI_EXT_RE = /\.(pdf|png|jpe?g|webp|gif)$/i;

  function isAllowedUploadFile(file) {
    if (!file) return false;
    const name = file.name || '';
    if (ALLOWED_EXT_RE.test(name)) return true;
    const type = file.type || '';
    return (
      type === 'application/pdf'
      || type.startsWith('image/')
      || type.includes('word')
      || type.includes('excel')
      || type.includes('spreadsheet')
      || type === 'text/csv'
      || type === 'application/csv'
      || type === 'text/plain'
    );
  }

  function isAiExtractable(file) {
    if (!file) return false;
    const type = file.type || '';
    if (type === 'application/pdf' || type.startsWith('image/')) return true;
    return AI_EXT_RE.test(file.name || '');
  }

  function openBlobFile(file) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    if (!w) showToast(t('toast_popup_allow'));
    setTimeout(() => URL.revokeObjectURL(url), 120000);
  }

  async function openSavedAttachment(letterMongoId, attachmentId) {
    const token = getToken();
    const res = await fetch(`${API}/letters/${letterMongoId}/download/${attachmentId}?view=1`, {
      headers: token ? { Authorization: 'Bearer ' + token } : {},
    });
    if (!res.ok) {
      let msg = t('toast_could_not_open');
      try { const d = await res.json(); msg = d.message || msg; } catch (e) { /* ignore */ }
      throw new Error(msg);
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const w = window.open(url, '_blank', 'noopener,noreferrer');
    if (!w) showToast(t('toast_popup_allow'));
    setTimeout(() => URL.revokeObjectURL(url), 120000);
  }

  window.rlmsOpenSavedAttachment = openSavedAttachment;
  window.rlmsOpenLocalFile = function (inputId) {
    const input = document.getElementById(inputId);
    if (input && input.files && input.files[0]) openBlobFile(input.files[0]);
  };

  function wireClickableFilename(el, onClick) {
    if (!el) return;
    el.style.cursor = 'pointer';
    el.style.textDecoration = 'underline';
    el.style.color = 'var(--railway-blue)';
    el.title = t('click_open_new_tab');
    el.onclick = (e) => { e.preventDefault(); e.stopPropagation(); onClick(); };
  }

  function renderAttachmentPanel(letter) {
    const panel = document.getElementById('view-pdf-attachment-panel');
    if (!panel) return;
    if (!letter || !letter.pdfName || !letter._id) {
      panel.innerHTML = '<span style="font-size: 12px; color: var(--text-muted); font-style: italic;">' + t("no_docs_attached") + '</span>';
      return;
    }
    const attId = letter.pdfAttachmentId || 'main';
    const safeName = letter.pdfName.replace(/</g, '&lt;');
    panel.innerHTML = `
      <span style="font-size: 24px;">📎</span>
      <div style="flex: 1;">
        <a href="#" class="rlms-open-doc-link" style="display:block;font-size:12px;font-weight:700;color:var(--railway-blue);text-decoration:underline;">${safeName}</a>
        <span style="font-size: 10px; color: var(--text-soft);">${t("click_open_new_tab")}</span>
      </div>
      <button type="button" class="btn btn-secondary btn-sm rlms-open-doc-btn">${t("btn_open")}</button>
    `;
    const open = () => openSavedAttachment(letter._id, attId).catch((e) => showToast(e.message));
    panel.querySelector('.rlms-open-doc-link').onclick = (e) => { e.preventDefault(); open(); };
    panel.querySelector('.rlms-open-doc-btn').onclick = open;
  }

  function renderRepliesWithAttachments(letter) {
    const container = document.getElementById('view-replies-timeline-container');
    if (!container || !letter) return;
    const replies = letter.replies || [];
    if (!replies.length) {
      container.innerHTML = '<div style="font-size: 11px; color: var(--text-muted); font-style: italic;">' + t("no_replies_logged") + '</div>';
      return;
    }
    container.innerHTML = replies.map((rep, idx) => {
      const att = rep.pdfName
        ? `<div style="margin-top:6px;"><a href="#" class="rlms-reply-att" data-idx="${idx}" style="font-size:11px;color:var(--railway-blue);text-decoration:underline;">📎 ${rep.pdfName.replace(/</g, '&lt;')}</a></div>`
        : '';
      return `
        <div class="timeline-bubble">
          <div class="timeline-header">
            <span>${rep.sender || t("unknown_sender")} (${rep.designation || t("lbl_na")})</span>
            <span>${rep.date || ''}</span>
          </div>
          <div class="timeline-comment">${rep.text || ''}</div>
          ${att}
        </div>`;
    }).join('');
    container.querySelectorAll('.rlms-reply-att').forEach((a) => {
      a.onclick = (e) => {
        e.preventDefault();
        const rep = replies[parseInt(a.getAttribute('data-idx'), 10)];
        if (rep && rep.attachmentId) {
          openSavedAttachment(letter._id, rep.attachmentId).catch((err) => showToast(err.message));
        }
      };
    });
  }

  // ========================================================================
  // DATA LOADERS
  // ========================================================================
  async function refreshLetters() {
    try {
      const data = await apiFetch('/letters');
      lettersDatabase = (data || []).map(apiToLocal);
    } catch (e) {
      console.error('Failed to load letters:', e.message);
      lettersDatabase = [];
    }
  }
  window.refreshLetters = refreshLetters;

  async function loadCategories() {
    try {
      const cats = await apiFetch('/letters/categories/list');
      const values = (cats || [])
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0))
        .map((c) => c.value);
      // Mutate the existing const array in place (cannot reassign a const).
      ROUTING_CHANNELS.length = 0;
      values.filter((v) => v !== 'Other').forEach((v) => ROUTING_CHANNELS.push(v));
      ROUTING_CHANNELS.push('Other');
      if (typeof renderSubmittedByDropdown === 'function') renderSubmittedByDropdown();
      if (typeof renderAiSubmittedByDropdown === 'function') renderAiSubmittedByDropdown();
      if (typeof renderFormPills === 'function') renderFormPills();
    } catch (e) {
      console.warn('Categories load failed, keeping defaults:', e.message);
    }
  }

  // ========================================================================
  // LOGIN / LOGOUT OVERRIDES
  // ========================================================================
  const LOGIN_USERS = {
    officer: [
      { username: 'priyangani', label: '151 — Priyangani (Officer)' },
      { username: 'gayanthi', label: '135 — Gayanthi (Officer)' },
      { username: 'purnima', label: '142 — Purnima (Officer)' },
      { username: 'dulani', label: '141 — Dulani (Officer)' },
      { username: 'chathura', label: '144 — Chathura (Officer)' },
      { username: 'erandi', label: '143 — Erandi (Officer)' },
      { username: 'sandareka', label: '140 — Sandareka (Officer)' },
      { username: 'chathurika', label: '137 — Chathurika (Officer)' },
      { username: 'prabhamili', label: '205 — Prabhamili (Officer)' },
    ],
    head: [{ username: 'hod', label: '152 — Head of Department' }],
    secretary: [
      { username: 'sec-admin', label: 'Addl. Sec. (Administration)' },
      { username: 'sec-dev', label: 'Addl. Sec. (Development)' },
      { username: 'sec-eng', label: 'Addl. Sec. (Engineering)' },
      { username: 'sec-slacs', label: 'Addl. Sec. (SLAcS - Special)' },
      { username: 'sec-slps', label: 'Addl. Sec. (SLPS - Special)' },
      { username: 'sec-special', label: 'Addl. Sec. (Special Projects)' },
    ],
    admin: [{ username: 'admin', label: 'admin — System Admin' }],
  };

  window.populateLoginSelectors = function () {
    const build = (id, list) => {
      const sel = document.getElementById(id);
      if (sel) sel.innerHTML = list.map((u) => `<option value="${u.username}">${u.label}</option>`).join('');
    };
    build('user-select-officer', LOGIN_USERS.officer);
    build('user-select-head', LOGIN_USERS.head);
    build('user-select-secretary', LOGIN_USERS.secretary);
    build('user-select-admin', LOGIN_USERS.admin);
  };

  // Auto-fill the default demo password and keep the field editable.
  window.updateSimulatedPassword = function () {
    const pass = document.getElementById('password-input');
    if (pass) {
      pass.removeAttribute('readonly');
      if (!pass.value || pass.value.indexOf('•') !== -1 || pass.value.indexOf('pass_') === 0) {
        pass.value = 'Password@123';
      }
    }
  };

  function applyPostLoginUI() {
    document.getElementById('login-screen').classList.remove('active');
    document.getElementById('app-screen').classList.add('active');

    document.getElementById('user-avatar').textContent = (currentUser.name || '?')[0];
    document.getElementById('user-display-name').textContent = currentUser.name;
    document.getElementById('user-display-role').textContent = designationLabel(currentUser.role) || currentUser.designation;

    const accessBadge = document.getElementById('user-display-access');
    accessBadge.removeAttribute('style');
    if (currentUser.role === 'head') {
      accessBadge.textContent = t('access_view_all');
      accessBadge.className = 'user-access-pill badge-head';
    } else if (currentUser.role === 'officer') {
      accessBadge.textContent = t('access_create_edit');
      accessBadge.className = 'user-access-pill badge-officer';
    } else if (currentUser.role === 'admin') {
      accessBadge.textContent = t('access_admin');
      accessBadge.className = 'user-access-pill badge-admin';
    } else {
      accessBadge.textContent = t('access_division');
      accessBadge.className = 'user-access-pill badge-secretary';
    }

    const welcomeUser = document.getElementById('welcome-username');
    if (welcomeUser) welcomeUser.textContent = currentUser.name;

    const isSec = currentUser.role === 'secretary';
    const isAdmin = currentUser.role === 'admin';
    const canCreate = currentUser.permissions.includes('create_letter');

    const show = (id, visible) => { const el = document.getElementById(id); if (el) el.style.display = visible ? 'flex' : 'none'; };
    show('nav-dashboard', !isSec && !isAdmin);
    show('nav-add-letter', !isSec && !isAdmin && canCreate);
    show('nav-ai-letter', !isSec && !isAdmin && canCreate);
    show('nav-ledger', !isSec && !isAdmin);
    show('nav-all-letters', !isSec && !isAdmin);
    show('nav-reminders', !isSec && !isAdmin);
    show('nav-secretary-inbox', isSec);
    show('nav-user-tracking', !isSec && !isAdmin);
    show('nav-history', !isSec && !isAdmin);
    show('nav-letter-export', !isSec && !isAdmin);
    show('nav-user-registration', isAdmin);

    if (isSec) navigateToPage('secretary-inbox');
    else if (isAdmin) navigateToPage('user-registration');
    else navigateToPage('dashboard');

    if (typeof updateReminderBadge === 'function') updateReminderBadge();
    showToast(t('signed_in_as') + ' ' + currentUser.name + ' (' + (designationLabel(currentUser.role) || currentUser.designation) + ')');
  }

  window.handleLogin = async function () {
    try {
      const username = getActiveSelectedUserId();
      const passEl = document.getElementById('password-input');
      const password = (passEl && passEl.value) ? passEl.value : 'Password@123';

      const data = await apiFetch('/auth/login', { method: 'POST', json: { username, password } });
      setToken(data.token);
      currentUser = buildCurrentUser(data.user);

      await loadCategories();
      await refreshLetters();
      applyPostLoginUI();
      if (typeof applyLanguage === 'function') applyLanguage();
    } catch (e) {
      showToast(e.message || t('toast_login_failed'));
    }
  };

  window.handleLogout = async function () {
    try { await apiFetch('/auth/logout', { method: 'POST' }); } catch (e) { /* ignore */ }
    clearTokenStore();
    currentUser = null;
    lettersDatabase = [];
    document.getElementById('app-screen').classList.remove('active');
    document.getElementById('login-screen').classList.add('active');
  };

  // ========================================================================
  // LETTER CREATE / UPDATE OVERRIDES
  // ========================================================================
  function appendIf(fd, key, val) {
    if (val !== undefined && val !== null && val !== '') fd.append(key, val);
  }

  function buildLetterFormData(fields, file) {
    const fd = new FormData();
    appendIf(fd, 'dateReceived', fields.dateReceived);
    appendIf(fd, 'referredEntity', fields.referredEntity);
    appendIf(fd, 'letterNumber', fields.letterNumber);
    appendIf(fd, 'letterDate', fields.letterDate);
    fd.append('title', fields.title || 'Untitled Subject');
    appendIf(fd, 'fileNumber', fields.fileNumber);
    appendIf(fd, 'actionTaken', fields.actionTaken);
    appendIf(fd, 'signatureStatus', fields.signatureStatus);
    appendIf(fd, 'presentedTo', fields.presentedTo);
    appendIf(fd, 'dateFileTransferred', fields.dateFileTransferred);
    appendIf(fd, 'dateOfFiling', fields.dateOfFiling);
    appendIf(fd, 'dateOfSignature', fields.dateOfSignature);
    appendIf(fd, 'dateOfMailing', fields.dateOfMailing);
    appendIf(fd, 'reminderDate', fields.reminderDate);
    appendIf(fd, 'customRecipientName', fields.customRecipientName);
    fd.append('sendTo', JSON.stringify(fields.sendTo || []));
    fd.append('sendCopiesTo', JSON.stringify(fields.sendCopiesTo || []));
    fd.append('status', fields.status || 'Draft');
    if (file) fd.append('pdf', file);
    return fd;
  }

  window.saveLetterData = async function (isDraftSave = true) {
    if (currentUser && !currentUser.permissions.includes('create_letter')) {
      showToast(t('toast_permission_denied'));
      return;
    }

    const val = (id) => { const el = document.getElementById(id); return el ? el.value : ''; };
    const editId = val('edit-letter-id');
    const dateReceived = val('field-date-received');
    const referringOrg = val('field-referring-org');
    const letterNumDate = val('field-letter-num-date');
    const subject = val('field-subject');
    const fileNumber = val('field-file-number');
    const actionTaken = val('field-action-taken');
    const signatureDropdown = val('field-signature-dropdown');
    const submittedTo = val('field-submitted-to');
    const dateForwarded = val('field-date-forwarded');
    const dateFileReceived = val('field-date-file-received');
    const dateSigned = val('field-date-signed');
    const dateMailed = val('field-date-mailed');
    const reminderDate = val('field-reminder-date');

    if (!isDraftSave) {
      if (!dateReceived || !referringOrg || !letterNumDate || !subject) {
        showToast(t('toast_mandatory_final'));
        return;
      }
    } else if (!subject && !referringOrg && !letterNumDate) {
      showToast(t('toast_mandatory_draft'));
      return;
    }

    const otherEl = document.getElementById('field-other-name');
    const otherName = otherEl ? otherEl.value.trim() : '';
    const hasOther = selectedSendTo.includes('Other') || selectedCcTo.includes('Other');
    if (hasOther && !otherName) {
      showToast(t('toast_other_name'));
      if (otherEl) otherEl.focus();
      return;
    }

    const finalSendTo = selectedSendTo.map((v) => (v === 'Other' ? otherName : v));
    const finalCcTo = selectedCcTo.map((v) => (v === 'Other' ? otherName : v));

    // Store any allowed document type (PDF, Word, Excel, CSV, image, etc.)
    const uploadInput = document.getElementById('field-pdf-upload');
    const file = uploadInput && uploadInput.files && uploadInput.files[0] ? uploadInput.files[0] : null;
    if (file && !isAllowedUploadFile(file)) {
      showToast(t('toast_file_type'));
      return;
    }

    const fields = {
      dateReceived: dateReceived || new Date().toISOString().split('T')[0],
      referredEntity: referringOrg,
      letterNumber: letterNumDate,
      title: subject || 'Untitled Subject (Draft)',
      fileNumber: fileNumber,
      actionTaken: actionTaken,
      signatureStatus: signatureDropdown,
      presentedTo: submittedTo,
      dateFileTransferred: dateForwarded,
      dateOfFiling: dateFileReceived,
      dateOfSignature: dateSigned,
      dateOfMailing: dateMailed,
      reminderDate: reminderDate,
      customRecipientName: otherName,
      sendTo: finalSendTo,
      sendCopiesTo: finalCcTo,
      status: isDraftSave ? 'Draft' : 'Completed',
    };

    try {
      if (editId) {
        const mongoId = findMongoId(editId);
        if (!mongoId) { showToast(t('toast_cannot_find_letter')); return; }
        await apiFetch('/letters/' + mongoId, { method: 'PUT', body: buildLetterFormData(fields, file) });
        showToast(t('toast_letter_updated'));
      } else {
        await apiFetch('/letters', { method: 'POST', body: buildLetterFormData(fields, file) });
        showToast(t('toast_letter_registered'));
      }
      await refreshLetters();
      clearActiveForm();
      navigateToPage('ledger');
    } catch (e) {
      showToast(e.message || t('toast_save_failed'));
    }
  };

  window.saveAiLetterData = async function (isDraftSave = true) {
    if (currentUser && !currentUser.permissions.includes('create_letter')) {
      showToast(t('toast_permission_denied'));
      return;
    }

    const val = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const letterNumber = val('ai-field-letter-number');
    const letterDate = document.getElementById('ai-field-letter-date').value;
    const subject = val('ai-field-subject');
    const recipientOther = document.getElementById('ai-field-recipient-other')
      ? document.getElementById('ai-field-recipient-other').value.trim() : '';
    const reminderDate = document.getElementById('ai-field-reminder-date').value;

    if (selectedAiSendTo.length === 0) {
      showToast(t('toast_ai_select_recipient'));
      return;
    }
    if (!isDraftSave) {
      if (!letterNumber || !letterDate || !subject) {
        showToast(t('toast_ai_mandatory_final'));
        return;
      }
    } else if (!letterNumber && !subject) {
      showToast(t('toast_ai_mandatory_draft'));
      return;
    }

    const finalSendTo = selectedAiSendTo.map((v) => (v === 'Other' ? recipientOther : v));
    const finalCcTo = selectedAiCcTo.map((v) => (v === 'Other' ? recipientOther : v));

    const inputFiles = (document.getElementById('ai-file-upload') || {}).files;
    const file = inputFiles && inputFiles[0] ? inputFiles[0] : null;
    if (file && !isAllowedUploadFile(file)) {
      showToast(t('toast_file_type'));
      return;
    }

    const fields = {
      dateReceived: new Date().toISOString().split('T')[0],
      referredEntity: 'General Manager Office',
      letterNumber: letterNumber,
      letterDate: letterDate,
      title: subject || 'Untitled Subject (Draft)',
      actionTaken: 'Registered via AI Letter Scanning workflow.',
      dateOfSignature: letterDate,
      reminderDate: reminderDate,
      customRecipientName: recipientOther,
      sendTo: finalSendTo,
      sendCopiesTo: finalCcTo,
      status: isDraftSave ? 'Draft' : 'Completed',
    };

    try {
      await apiFetch('/letters', { method: 'POST', body: buildLetterFormData(fields, file) });
      showToast(t('toast_letter_registered'));
      await refreshLetters();
      clearAiForm();
      navigateToPage('ledger');
    } catch (e) {
      showToast(e.message || t('toast_save_failed'));
    }
  };

  // ========================================================================
  // AI LETTER EXTRACTION (handwritten Sinhala/English -> auto-filled fields)
  // ========================================================================
  async function extractFromScan(file) {
    const fd = new FormData();
    fd.append('file', file);
    return apiFetch('/ai/extract', { method: 'POST', body: fd });
  }
  window.extractFromScan = extractFromScan;

  // --- AI Letter Scanning page ---
  window.handleAiFileUpload = async function (input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (!isAllowedUploadFile(file)) {
      showToast(t('toast_file_type'));
      input.value = '';
      return;
    }

    aiActiveAttachedPdf = file.name;
    const si = currentLang === 'si';

    const showPreview = () => {
      const pf = document.getElementById('ai-preview-filename');
      if (pf) {
        pf.textContent = file.name;
        wireClickableFilename(pf, () => openBlobFile(file));
      }
      const dpc = document.getElementById('ai-doc-preview-container');
      if (dpc) dpc.style.display = 'block';
    };

    if (!isAiExtractable(file)) {
      const dragZone = document.getElementById('ai-drag-zone');
      if (dragZone) dragZone.style.display = 'none';
      showPreview();
      showToast(si ? 'ගොනුව ඇමුණුම් කරන ලදී — ක්ලික් කර නව ටැබ් එකක විවෘත කරන්න' : 'File attached — click the name to open in a new tab');
      return;
    }

    const dragZone = document.getElementById('ai-drag-zone');
    const progContainer = document.getElementById('ai-progress-container');
    const fill = document.getElementById('ai-progress-bar-fill');
    const statusText = document.getElementById('ai-progress-status-title');
    if (dragZone) dragZone.style.display = 'none';
    if (progContainer) progContainer.style.display = 'block';

    const steps = [
      si ? 'ගොනුව උඩුගත කරන ලදී' : 'Document uploaded',
      si ? 'පෙළ කියවමින් (OCR)' : 'Reading text (OCR)',
      si ? 'කෘතිම බුද්ධි විශ්ලේෂණය' : 'Analyzing with AI',
      si ? 'ක්ෂේත්‍ර ලබා ගනිමින්' : 'Extracting fields',
    ];
    const setStep = (i, cls, prefix) => {
      const el = document.getElementById('ocr-step-' + i);
      if (el) { el.className = 'ocr-step ' + cls; el.textContent = prefix + ' ' + steps[i - 1]; }
    };
    for (let i = 1; i <= 4; i++) setStep(i, '', '○');
    if (fill) { fill.style.width = '10%'; fill.textContent = '10%'; }
    if (statusText) statusText.textContent = si ? 'පරිලෝකනය ආරම්භ...' : 'Starting scan...';

    let s = 0;
    const anim = setInterval(() => {
      if (s < 3) {
        setStep(s + 1, 'completed', '✓');
        s++;
        setStep(Math.min(s + 1, 4), 'active', '○');
        if (fill) { fill.style.width = (s * 25) + '%'; fill.textContent = (s * 25) + '%'; }
      }
    }, 500);

    try {
      const data = await extractFromScan(file);
      clearInterval(anim);
      for (let i = 1; i <= 4; i++) setStep(i, 'completed', '✓');
      if (fill) { fill.style.width = '100%'; fill.textContent = '100%'; }
      if (statusText) statusText.textContent = si ? 'අවසන්!' : 'Complete!';

      setTimeout(() => {
        if (progContainer) progContainer.style.display = 'none';
        const num = data.letterNumber || '';
        const date = data.letterDate || '';
        const subj = data.subject || '';
        const numEl = document.getElementById('ai-field-letter-number');
        const dateEl = document.getElementById('ai-field-letter-date');
        const subjEl = document.getElementById('ai-field-subject');
        if (numEl && num) numEl.value = num;
        if (dateEl && date) dateEl.value = date;
        if (subjEl && subj) subjEl.value = subj;

        const mn = document.getElementById('mock-doc-no');
        const md = document.getElementById('mock-doc-date');
        const ms = document.getElementById('mock-doc-subject');
        if (mn) mn.textContent = num || '—';
        const dp = (date || '').split('-');
        if (md) md.textContent = dp.length === 3 ? `${dp[2]}/${dp[1]}/${dp[0]}` : (date || '—');
        if (ms) ms.textContent = (subj || '').toUpperCase();

        showPreview();
        const notice = document.getElementById('ai-prefilled-notice');
        if (notice) notice.style.display = 'flex';

        const conf = data.confidence ? ` (${data.confidence})` : '';
        showToast((si ? 'AI ක්ෂේත්‍ර පුරවන ලදී' : 'AI scan complete — fields populated') + conf);
      }, 500);
    } catch (e) {
      clearInterval(anim);
      if (progContainer) progContainer.style.display = 'none';
      showPreview();
      showToast(e.message || 'AI extraction failed; file is still attached.');
    }
  };

  // --- Main "Add Letter" full form: attach + optional AI auto-fill ---
  window.simulatePdfUpload = async function (input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (!isAllowedUploadFile(file)) {
      showToast(t('toast_file_type'));
      input.value = '';
      return;
    }

    activeAttachedPdf = file.name;
    const si = currentLang === 'si';

    const infoNode = document.getElementById('uploader-info-node');
    if (infoNode) infoNode.style.display = 'none';
    const badge = document.getElementById('attached-pdf-badge');
    const nameEl = document.getElementById('attached-pdf-name');
    if (nameEl) {
      nameEl.textContent = file.name;
      wireClickableFilename(nameEl, () => openBlobFile(file));
    }
    if (badge) badge.style.display = 'inline-flex';

    if (!isAiExtractable(file)) {
      showToast(si ? 'ගොනුව ඇමුණුම් කරන ලදී — නම ක්ලික් කර නව ටැබ් එකක විවෘත කරන්න' : 'File attached — click the name to open in a new tab');
      return;
    }

    showToast(si ? 'AI මඟින් ක්ෂේත්‍ර කියවමින්...' : 'Reading letter with AI...');
    try {
      const data = await extractFromScan(file);
      const setIfEmpty = (id, value) => {
        const el = document.getElementById(id);
        if (!el || !value || el.value) return;
        if (el.tagName === 'SELECT' && typeof setSelectValueWithFallback === 'function') {
          setSelectValueWithFallback(id, value);
          return;
        }
        el.value = value;
      };
      setIfEmpty('field-date-received', data.dateReceived);
      setIfEmpty('field-referring-org', data.referredEntity);
      const lnd = [data.letterNumber, data.letterDate].filter(Boolean).join(' - ');
      setIfEmpty('field-letter-num-date', lnd);
      setIfEmpty('field-subject', data.subject);
      setIfEmpty('field-file-number', data.fileNumber);
      const conf = data.confidence ? ` (${data.confidence})` : '';
      showToast((si ? 'AI ක්ෂේත්‍ර පුරවන ලදී' : 'AI auto-filled fields from scan') + conf);
    } catch (e) {
      showToast(e.message || 'AI extraction failed; file is still attached.');
    }
  };

  // ========================================================================
  // REPLY OVERRIDE (secretary)
  // ========================================================================
  window.submitReplyAction = async function () {
    const letterId = document.getElementById('reply-letter-id').value;
    const replyNotes = document.getElementById('field-reply-notes').value.trim();
    if (!replyNotes) { showToast(t('toast_remarks_empty')); return; }

    const mongoId = findMongoId(letterId);
    if (!mongoId) { showToast(t('toast_cannot_find_letter')); return; }

    const fd = new FormData();
    fd.append('note', replyNotes);
    const replyFiles = (document.getElementById('field-reply-pdf') || {}).files;
    if (replyFiles && replyFiles[0]) {
      if (!isAllowedUploadFile(replyFiles[0])) {
        showToast(t('toast_file_type'));
        return;
      }
      fd.append('pdf', replyFiles[0]);
    }

    try {
      await apiFetch('/letters/' + mongoId + '/replies', { method: 'POST', body: fd });
      await refreshLetters();
      closeModalSystem('reply-action-modal');
      if (document.getElementById('page-secretary-inbox') &&
          document.getElementById('page-secretary-inbox').classList.contains('active')) {
        renderSecretaryInbox();
      }
      showToast(`${t('reply_logged_prefix')} ${letterId}`);
    } catch (e) {
      showToast(e.message || t('toast_reply_failed'));
    }
  };

  // ========================================================================
  // REMINDER + NO-ACTION OVERRIDE (officer)
  // ========================================================================
  window.saveInlineReminderDate = async function () {
    const letterId = document.getElementById('inline-reminder-letter-id').value;
    const newDate = document.getElementById('inline-reminder-date-input').value;
    const newNotes = document.getElementById('inline-reminder-notes-input').value.trim();
    const mongoId = findMongoId(letterId);
    if (!mongoId) { showToast(t('toast_cannot_find_letter')); return; }

    const noActionCheckbox = document.getElementById('inline-no-action-checkbox');
    const noActionDateInput = document.getElementById('inline-no-action-date-input');
    const noActionRemarks = document.getElementById('inline-no-action-remarks-input').value.trim();
    const letter = (lettersDatabase || []).find((l) => l.id === letterId) || {};

    try {
      if (noActionCheckbox.checked) {
        if (!noActionDateInput.value) {
          showToast(currentLang === 'si' ? "කරුණාකර 'ක්‍රියාමාර්ග ගෙන නොමැති' සඳහා දිනයක් තෝරන්න." : "Please select a date for 'No Action Taken'.");
          noActionDateInput.focus();
          return;
        }
        await apiFetch('/letters/' + mongoId + '/status', {
          method: 'PATCH',
          json: { status: 'NoAction', noActionDate: noActionDateInput.value, noActionRemarks: noActionRemarks },
        });
      } else if (letter.isNoActionTaken) {
        await apiFetch('/letters/' + mongoId + '/status', { method: 'PATCH', json: { status: 'Pending' } });
      }

      if (newDate) {
        await apiFetch('/letters/' + mongoId + '/reminder', {
          method: 'PATCH',
          json: { reminderDate: newDate, notes: newNotes },
        });
      } else if (letter.reminderDate) {
        await apiFetch('/letters/' + mongoId + '/reminder', { method: 'PATCH', json: { reminderDate: '', notes: 'Cleared reminder' } });
      }

      await refreshLetters();
      if (typeof updateReminderBadge === 'function') updateReminderBadge();
      closeModalSystem('edit-reminder-modal');
      if (typeof renderReminderPage === 'function') renderReminderPage();
      if (typeof renderAllLetters === 'function') renderAllLetters();
      if (typeof populateLedgerTable === 'function') populateLedgerTable();
      showToast(t('toast_reminder_saved'));
    } catch (e) {
      showToast(e.message || t('toast_update_failed'));
    }
  };

  // ========================================================================
  // USER MANAGEMENT OVERRIDES (admin)
  // ========================================================================
  window.handleUserRegistration = async function (event) {
    event.preventDefault();
    const val = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
    const userId = val('reg-user-id');
    const fullName = val('reg-user-name');
    const designation = val('reg-user-designation');
    const role = document.getElementById('reg-user-role').value;
    const category = document.getElementById('reg-user-category').value;

    if (!userId || !fullName || !designation) {
      showToast(t('toast_fill_required'));
      return;
    }

    const payload = {
      username: userId.toLowerCase(),
      password: 'Password@123',
      fullName: fullName,
      employeeId: userId,
      designation: designation,
      role: role,
    };
    if (role === 'secretary') payload.secretaryCategory = category;

    try {
      await apiFetch('/users', { method: 'POST', json: payload });
      showToast(t('toast_user_created'));
      document.getElementById('user-registration-form').reset();
      if (typeof toggleRegSubjectField === 'function') toggleRegSubjectField();
      renderRegisteredUsersDirectory();
    } catch (e) {
      showToast(e.message || t('toast_user_create_failed'));
    }
  };

  window.renderRegisteredUsersDirectory = async function () {
    const tbody = document.getElementById('registered-users-tbody');
    if (!tbody) return;
    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">${t('loading')}</td></tr>`;
    try {
      const users = await apiFetch('/users');
      if (!users || users.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">${t('no_users_found')}</td></tr>`;
        return;
      }
      tbody.innerHTML = users.map((u) => {
        const subject = u.secretaryCategory ? u.secretaryCategory.replace('Additional Secretaries - ', '') : '—';
        const status = u.isActive ? t('user_active') : t('user_inactive');
        const roleLabel = (typeof designationLabel === 'function' ? designationLabel(u.role) : '') || u.role;
        return `
          <tr>
            <td><strong>${u.employeeId || u.username}</strong></td>
            <td>${u.fullName}</td>
            <td><span class="role-badge badge-${u.role}" style="text-transform: capitalize;">${roleLabel}</span></td>
            <td>${subject}</td>
            <td style="font-size:11px;color:var(--text-soft);">
              ${status}
              <button class="btn btn-outline btn-sm" style="margin-left:6px;" onclick="rlmsToggleUserStatus('${u._id}', ${!u.isActive})">${u.isActive ? t('btn_deactivate') : t('btn_activate')}</button>
              <button class="btn btn-secondary btn-sm" onclick="rlmsResetUserPassword('${u._id}')">${t('btn_reset_pw')}</button>
            </td>
          </tr>`;
      }).join('');
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--color-pending);">${e.message}</td></tr>`;
    }
  };

  window.rlmsToggleUserStatus = async function (id, isActive) {
    try {
      await apiFetch('/users/' + id + '/status', { method: 'PATCH', json: { isActive } });
      showToast(t('toast_user_status_updated'));
      renderRegisteredUsersDirectory();
    } catch (e) {
      showToast(e.message || t('toast_update_failed'));
    }
  };

  window.rlmsResetUserPassword = async function (id) {
    try {
      await apiFetch('/users/' + id + '/reset-password', { method: 'PATCH', json: { password: 'Password@123' } });
      showToast(t('toast_password_reset'));
    } catch (e) {
      showToast(e.message || t('toast_reset_failed'));
    }
  };

  // ========================================================================
  // HISTORY / AUDIT LOG OVERRIDE
  // ========================================================================
  window.renderHistoryLog = async function () {
    const tbody = document.getElementById('history-log-tbody');
    const emptyState = document.getElementById('history-empty-state');
    const table = document.getElementById('history-log-table');
    if (!tbody) return;

    const fromVal = (document.getElementById('history-filter-from') || {}).value || '';
    const toVal = (document.getElementById('history-filter-to') || {}).value || '';

    tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--text-muted);">${t('loading')}</td></tr>`;
    try {
      const params = [];
      if (fromVal) params.push('from=' + encodeURIComponent(fromVal));
      if (toVal) params.push('to=' + encodeURIComponent(toVal));
      const logs = await apiFetch('/audit-logs' + (params.length ? ('?' + params.join('&')) : ''));

      if (!logs || logs.length === 0) {
        tbody.innerHTML = '';
        if (table) table.style.display = 'none';
        if (emptyState) emptyState.style.display = 'flex';
        return;
      }
      if (table) table.style.display = '';
      if (emptyState) emptyState.style.display = 'none';

      tbody.innerHTML = logs.map((log) => {
        const when = new Date(log.createdAt).toLocaleString(currentLang === 'si' ? 'si-LK' : undefined);
        const who = log.userName || (log.user ? log.user.fullName : t('lbl_system'));
        const actionLabel = (typeof auditActionLabel === 'function') ? auditActionLabel(log.action) : log.action;
        const detailsLabel = log.details
          ? ((typeof auditDetailsLabel === 'function') ? auditDetailsLabel(log.details) : log.details)
          : '';
        const action = actionLabel + (detailsLabel ? ` — ${detailsLabel}` : '');
        const ref = log.letterId || (log.letterRef ? log.letterRef.letterId : '') || '-';
        const roleLabel = (typeof roleBadgeLabel === 'function') ? roleBadgeLabel(log.userRole) : (log.userRole || '');
        return `
          <tr>
            <td>${when}</td>
            <td>${who} <span class="role-badge badge-${log.userRole || 'system'}" style="font-size:9px;">${roleLabel}</span></td>
            <td>${action}</td>
            <td>${ref}</td>
            <td><span style="font-size:11px;color:var(--text-muted);">${log.ipAddress || ''}</span></td>
          </tr>`;
      }).join('');
    } catch (e) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;color:var(--color-pending);">${e.message}</td></tr>`;
    }
  };

  // The backend already scopes /letters per role (officers/head see all,
  // secretaries see only their category incl. "All"). Trust that list instead
  // of re-filtering on the client, which avoided the "All" recipient case.
  window.getFilteredLettersList = function () {
    return lettersDatabase || [];
  };

  // ========================================================================
  // VIEW / EDIT: open attachments in a new tab
  // ========================================================================
  const _origViewLetterDetails = window.viewLetterDetails;
  window.viewLetterDetails = function (letterId) {
    _origViewLetterDetails(letterId);
    const letter = (lettersDatabase || []).find((l) => l.id === letterId);
    if (letter) {
      renderAttachmentPanel(letter);
      renderRepliesWithAttachments(letter);
    }
  };

  const _origEditLetter = window.editLetter;
  window.editLetter = function (letterId) {
    _origEditLetter(letterId);
    const letter = (lettersDatabase || []).find((l) => l.id === letterId);
    const nameEl = document.getElementById('attached-pdf-name');
    if (letter && letter.pdfName && letter._id && nameEl) {
      wireClickableFilename(nameEl, () => {
        openSavedAttachment(letter._id, letter.pdfAttachmentId || 'main').catch((e) => showToast(e.message));
      });
    }
  };

  window.handleReplyPdfUpload = function (input) {
    if (!input.files || !input.files[0]) return;
    const file = input.files[0];
    if (!isAllowedUploadFile(file)) {
      showToast(t('toast_file_type'));
      input.value = '';
      return;
    }
    activeReplyPdf = file.name;
    const statusText = document.getElementById('reply-pdf-status-text');
    if (statusText) {
      statusText.textContent = currentLang === 'si' ? ` ඇමුණුවා: ${file.name}` : ` Attached: ${file.name}`;
      wireClickableFilename(statusText, () => openBlobFile(file));
    }
    showToast(`${t('file_attached_prefix')} ${file.name}`);
  };

  // ========================================================================
  // NEUTRALISE localStorage PERSISTENCE (data now lives in MongoDB)
  // ========================================================================
  window.saveToStorage = function () { /* persistence handled by backend */ };

  // ========================================================================
  // INIT (after DOM ready) — make login field usable with real credentials
  // ========================================================================
  document.addEventListener('DOMContentLoaded', function () {
    const pass = document.getElementById('password-input');
    if (pass) {
      pass.removeAttribute('readonly');
      pass.value = 'Password@123';
    }
    if (typeof populateLoginSelectors === 'function') populateLoginSelectors();
  });
})();
