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

export function reminderStatusClass(rs) {
  if (rs === 'completed') return 'badge-completed';
  if (rs === 'overdue' || rs === 'no-action') return 'badge-overdue';
  if (rs === 'upcoming') return 'badge-draft';
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
