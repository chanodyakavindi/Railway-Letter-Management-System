import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { notificationsApi } from '../api';
import { useLanguage } from '../context/LanguageContext';
import { displayUserName } from '../utils/i18n';

export default function Header({ title, search, onSearch }) {
  const { user } = useAuth();
  const { lang, setLang, pick, t } = useLanguage();
  const [clock, setClock] = useState('');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const tick = () => {
      if (lang === 'si') {
        const now = new Date();
        let hours = now.getHours();
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        const period = hours < 12 ? 'පෙ.ව.' : 'ප.ව.';
        hours = hours % 12 || 12;
        setClock(`${hours}:${minutes}:${seconds} ${period}`);
      } else {
        setClock(new Date().toLocaleTimeString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        }));
      }
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [lang]);

  useEffect(() => {
    notificationsApi.unreadCount()
      .then(({ data }) => setUnread(data.count))
      .catch(() => {});
  }, []);

  return (
    <header className="workspace-header">
      <div className="header-breadcrumbs">
        <span className="active">{pick(title)}</span>
      </div>
      <div className="header-actions-row">
        <div className="btn-group-toggle header-lang-toggle">
          <button
            type="button"
            className={`btn btn-outline btn-sm ${lang === 'en' ? 'active' : ''}`}
            onClick={() => setLang('en')}
            aria-label={t('English', 'ඉංග්‍රීසි')}
          >
            EN
          </button>
          <button
            type="button"
            className={`btn btn-outline btn-sm ${lang === 'si' ? 'active' : ''}`}
            onClick={() => setLang('si')}
            aria-label={t('Sinhala', 'සිංහල')}
          >
            සි
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
        <Link to="/notifications" className="notif-btn" aria-label={t('Notifications', 'දැනුම්දීම්')}>
          <svg className="notif-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path
              d="M15 17h5l-1.4-1.4A2 2 0 0 1 18 14.2V11a6 6 0 1 0-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M10 20a2 2 0 0 0 4 0"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
          {unread > 0 && <span className="notif-badge">{unread}</span>}
        </Link>
        <Link to="/history" className="btn btn-outline btn-sm">{t('History', 'ඉතිහාසය')}</Link>
        <time className="live-clock" dateTime={clock}>{clock}</time>
        <span className="header-profile-icon" aria-label={displayUserName(user, lang) || user?.fullName}>
          <svg className="profile-icon" viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="12" cy="8" r="3.5" fill="none" stroke="currentColor" strokeWidth="1.75" />
            <path
              d="M5.5 19.5c.8-2.8 3.4-4.5 6.5-4.5s5.7 1.7 6.5 4.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </span>
      </div>
    </header>
  );
}
