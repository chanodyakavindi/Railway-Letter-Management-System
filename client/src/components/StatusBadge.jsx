import { statusClass, reminderStatusClass } from '../utils/helpers';

export default function StatusBadge({ status, reminderStatus }) {
  const cls = reminderStatus ? reminderStatusClass(reminderStatus) : statusClass(status);
  const label = status || reminderStatus || 'Unknown';
  return <span className={`status-badge ${cls}`}>{label}</span>;
}
