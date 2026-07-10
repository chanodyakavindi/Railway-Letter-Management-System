import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard / පුවරුව', roles: ['head', 'officer', 'secretary'] },
  { to: '/add-letter', label: 'Add Letter / ලිපියක් එක් කරන්න', roles: ['officer'] },
  { to: '/add-letter-quick', label: 'Add Letter Option 2 / දෙවන ක්‍රමය', roles: ['officer'] },
  { to: '/letters', label: 'All Letters / සියලු ලිපි', roles: ['head', 'officer'] },
  { to: '/secretary-inbox', label: 'Secretary Inbox / ලේකම් එන ලිපි', roles: ['secretary'] },
  { to: '/reminders', label: 'Reminders / මතක් කිරීම්', roles: ['head', 'officer'] },
  { to: '/action-tracking', label: 'Action Tracking / ක්‍රියාමාර්ග', roles: ['head', 'officer'] },
  { to: '/user-tracking', label: 'User Tracking / පරිශීලක', roles: ['head', 'admin'] },
  { to: '/export', label: 'Export Report / නිර්යාතය', roles: ['head', 'officer'] },
  { to: '/users', label: 'User Management / පරිශීලක', roles: ['admin'] },
  { to: '/history', label: 'History Log / ඉතිහාසය', roles: ['head', 'officer'] },
  { to: '/notifications', label: 'Notifications / දැනුම්දීම්', roles: ['head', 'officer', 'secretary'] },
];

export default function Sidebar({ reminderCount, onLogout }) {
  const { user, hasRole } = useAuth();
  const initial = user?.fullName?.charAt(0) || 'U';

  const roleLabel = {
    admin: 'System Admin',
    head: 'Head of Department',
    officer: 'Department Officer',
    secretary: 'Additional Secretary',
  }[user?.role] || user?.role;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">🚂</div>
        <div className="brand-texts">
          <span className="brand-main">Railway Letter Monitoring System</span>
        </div>
      </div>

      <div className="current-user-card">
        <div className="user-avatar-circle">{initial}</div>
        <div className="user-details">
          <div className="user-name-display">{user?.fullName}</div>
          <div className="user-role-display">{roleLabel}</div>
          <div className="user-access-pill">{user?.username}</div>
        </div>
      </div>

      <nav className="sidebar-menu">
        {NAV_ITEMS.filter((item) => hasRole(...item.roles)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          >
            <span>{item.label}</span>
            {item.to === '/reminders' && reminderCount > 0 && (
              <span className="menu-badge">{reminderCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="btn-logout" onClick={onLogout}>
          <span className="logout-icon">↩</span>
          <span>Sign Out / පිටවීම</span>
        </button>
      </div>
    </aside>
  );
}
