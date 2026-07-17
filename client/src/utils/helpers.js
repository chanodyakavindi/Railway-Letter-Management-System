export function formatDate(d) {
  if (!d) return '-';
  return new Date(d).toLocaleDateString('en-GB');
}

export function formatDateTime(d) {
  if (!d) return '-';
  return new Date(d).toLocaleString('en-GB');
}

export function statusClass(status) {
  const map = {
    Draft: 'badge-draft',
    Pending: 'badge-pending',
    Completed: 'badge-completed',
    NoAction: 'badge-noaction',
    Overdue: 'badge-overdue',
  };
  return map[status] || 'badge-neutral';
}

function normalizeStateKey(value) {
  return String(value || '').trim().toLowerCase().replace(/[^a-z0-9]+/g, '');
}

export function getLetterBadgeClasses(status, reminderStatus) {
  const classes = [];
  const normalizedStatus = normalizeStateKey(status);
  const normalizedReminder = normalizeStateKey(reminderStatus);

  if (normalizedStatus === 'draft') classes.push('badge-draft');
  else if (normalizedStatus === 'pending') classes.push('badge-pending');
  else if (normalizedStatus === 'completed') classes.push('badge-completed');
  else if (normalizedStatus === 'noaction') classes.push('badge-noaction');
  else if (normalizedStatus === 'overdue') classes.push('badge-overdue');
  else classes.push('badge-neutral');

  if (normalizedReminder === 'upcoming') classes.push('badge-upcoming');
  else if (normalizedReminder === 'overdue' || normalizedReminder === 'noaction') classes.push('badge-overdue');
  else if (normalizedReminder === 'completed') classes.push('badge-completed');

  return [...new Set(classes)];
}

export function getLetterRowClasses(status, reminderStatus) {
  const classes = [];
  const normalizedStatus = normalizeStateKey(status);
  const normalizedReminder = normalizeStateKey(reminderStatus);

  if (normalizedStatus === 'draft') classes.push('row-status-draft');
  else if (normalizedStatus === 'pending') classes.push('row-status-pending');
  else if (normalizedStatus === 'completed') classes.push('row-status-completed');
  else if (normalizedStatus === 'noaction') classes.push('row-status-noaction');
  else if (normalizedStatus === 'overdue') classes.push('row-status-overdue');

  if (normalizedReminder === 'upcoming') classes.push('row-status-reminder-upcoming');
  if (normalizedReminder === 'overdue' || normalizedReminder === 'noaction') classes.push('row-status-reminder-overdue');

  return classes.join(' ');
}

export function getLetterDisplayLabel(status, reminderStatus) {
  const statusLabels = {
    draft: 'Draft',
    pending: 'Pending',
    completed: 'Completed',
    noaction: 'No Action',
    overdue: 'Overdue',
  };
  const reminderLabels = {
    upcoming: 'Upcoming Reminder',
    overdue: 'Overdue Reminder',
    noaction: 'No Action Reminder',
    completed: 'Completed Reminder',
  };

  const normalizedStatus = normalizeStateKey(status);
  const normalizedReminder = normalizeStateKey(reminderStatus);
  const parts = [];

  if (statusLabels[normalizedStatus]) {
    parts.push(statusLabels[normalizedStatus]);
  } else if (status) {
    parts.push(status);
  }

  if (normalizedReminder && normalizedReminder !== 'none' && normalizedReminder !== normalizedStatus) {
    const label = reminderLabels[normalizedReminder];
    if (label) parts.push(label);
  }

  return parts.join(' + ') || 'Unknown';
}

export function reminderStatusClass(rs) {
  if (rs === 'completed') return 'badge-completed';
  if (rs === 'overdue' || rs === 'no-action') return 'badge-overdue';
  if (rs === 'upcoming') return 'badge-upcoming';
  return 'badge-neutral';
}

export function defaultReminderDate(dateReceived) {
  const d = dateReceived ? new Date(dateReceived) : new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString().split('T')[0];
}

export function buildLetterFormData(fields, pdfFile) {
  const fd = new FormData();
  Object.entries(fields).forEach(([key, val]) => {
    if (val === undefined || val === null) return;
    if (Array.isArray(val)) {
      fd.append(key, JSON.stringify(val));
    } else {
      fd.append(key, val);
    }
  });
  if (pdfFile) fd.append('pdf', pdfFile);
  return fd;
}

export async function downloadWithAuth(url, filename) {
  const token = localStorage.getItem('rlms_token');
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error('Download failed');
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objectUrl;
  a.download = filename;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
}
