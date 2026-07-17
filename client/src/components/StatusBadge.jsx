import { getLetterBadgeClasses, getLetterDisplayLabel } from '../utils/helpers';

export default function StatusBadge({ status, reminderStatus }) {
  const classes = getLetterBadgeClasses(status, reminderStatus);
  const label = getLetterDisplayLabel(status, reminderStatus);
  return <span className={`status-badge ${classes.join(' ')}`}>{label}</span>;
}
