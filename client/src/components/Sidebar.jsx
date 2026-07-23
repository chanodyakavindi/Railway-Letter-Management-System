import { NavLink } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { displayUserName } from '../utils/i18n';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard / පුවරුව', roles: ['head', 'officer', 'secretary'] },
  { to: '/add-letter', label: 'Add Letter / ලිපියක් එක් කරන්න', roles: ['officer'] },
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
  const [dark, setDark] = useState(() => !!document.body.classList.contains('dark-theme'));
  useEffect(() => {
    if (dark) document.body.classList.add('dark-theme');
    else document.body.classList.remove('dark-theme');
  }, [dark]);

  const toggleTheme = () => setDark((d) => !d);

  const { user, hasRole } = useAuth();
  const { pick, t, lang } = useLanguage();
  const initial = (displayUserName(user, lang) || 'U').charAt(0);

  const roleLabel = {
    admin: t('System Admin', 'පද්ධති පරිපාලක'),
    head: t('Head of Department', 'දෙපාර්තමේන්තු ප්‍රධානියා'),
    officer: t('Department Officer', 'දෙපාර්තමේන්තු නිලධාරී'),
    secretary: t('Additional Secretary', 'අතිරේක ලේකම්'),
  }[user?.role] || user?.role;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">
        <div className="brand-icon">🚂</div>
        <div className="brand-texts">
          <span className="brand-main">
            {t('RAILWAY LETTER MANAGEMENT SYSTEM', 'දුම්රිය ලිපි කළමනාකරණ පද්ධතිය')}
          </span>
        </div>
      </div>

      <div className="current-user-card">
        <div className="user-avatar-circle">{initial}</div>
        <div className="user-details">
          <div className="user-name-display">{displayUserName(user, lang)}</div>
          <div className="user-role-display">{roleLabel}</div>
        </div>
      </div>

      <nav className="sidebar-menu">
        {NAV_ITEMS.filter((item) => hasRole(...item.roles)).map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `menu-item ${isActive ? 'active' : ''}`}
          >
            <span>{pick(item.label)}</span>
            {item.to === '/reminders' && reminderCount > 0 && (
              <span className="menu-badge">{reminderCount}</span>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <button type="button" className="theme-toggle-btn" onClick={toggleTheme}>
          <span className="theme-icon">{dark ? '🌙' : '☀️'}</span>
          <span>{dark ? t('Dark Mode', 'අඳුරු ආකාරය') : t('Light Mode', 'ආලෝක ආකාරය')}</span>
        </button>
        <button type="button" className="btn-logout" onClick={onLogout}>
          <span className="logout-icon">↩</span>
          <span>{t('Sign Out', 'පිටවීම')}</span>
        </button>
      </div>
    </aside>
  );
}
