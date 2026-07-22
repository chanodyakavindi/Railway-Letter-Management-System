import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../api';
import { useLanguage } from '../context/LanguageContext';

export default function Header({ title, search, onSearch }) {
  const { user } = useAuth();
  const { lang, setLang, pick, t } = useLanguage();
  const [clock, setClock] = useState('');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const tick = () => setClock(new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 60000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    notificationsApi.unreadCount()
      .then(({ data }) => setUnread(data.count))
      .catch(() => {});
  }, []);

  return (
    <header className="workspace-header">
      <div className="header-breadcrumbs">
        <span className="breadcrumb-separator">/</span>
        <span className="active">{pick(title)}</span>
      </div>
      <div className="header-actions-row">
        <div className="btn-group-toggle" style={{ marginRight: 10 }}>
          <button
            type="button"
            className={`btn btn-outline btn-sm ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
          >
            EN
          </button>
          <button
            type="button"
            className={`btn btn-outline btn-sm ${lang === 'si' ? 'active' : ''}`}
            onClick={() => setLang('si')}
          >
            SI
          </button>
        </div>
        {onSearch && (
          <div className="search-input-wrap header-search">
            <span className="search-icon" />
            <input
              type="text"
              placeholder={t('Search letters...', 'ලිපි සොයන්න...')}
              value={search || ''}
              onChange={(e) => onSearch(e.target.value)}
            />
          </div>
        )}
        <Link to="/notifications" className="notif-btn">
          🔔
          {unread > 0 && <span className="notif-badge">{unread}</span>}
        </Link>
        <Link to="/history" className="btn btn-outline btn-sm">{t('History', 'ඉතිහාසය')}</Link>
        <span className="live-clock">{clock}</span>
        <span className="header-user">{user?.fullName}</span>
      </div>
    </header>
  );
}
