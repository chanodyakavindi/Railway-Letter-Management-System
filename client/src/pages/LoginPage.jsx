import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

const DEFAULT_PASSWORD = 'Password@123';

const ROLE_GROUPS = {
  officer: {
    tab: 'Department Officer / දෙපාර්තමේන්තු නිලධාරී',
    badge: 'Create/Edit Access (No Delete) / නිර්මාණය හා සංස්කරණය (මකා දැමීම නැත)',
    badgeClass: 'badge-officer',
    users: [
      { username: 'priyangani', label: '151 — Priyangani (Officer) / 151 — ප්‍රියංගනී (නිලධාරී)' },
      { username: 'gayanthi', label: '135 — Gayanthi (Officer) / 135 — ගයන්ති (නිලධාරී)' },
      { username: 'purnima', label: '142 — Purnima (Officer) / 142 — පූර්ණිමා (නිලධාරී)' },
      { username: 'dulani', label: '141 — Dulani (Officer) / 141 — දුලානි (නිලධාරී)' },
      { username: 'chathura', label: '144 — Chathura (Officer) / 144 — චතුර (නිලධාරී)' },
      { username: 'erandi', label: '143 — Erandi (Officer) / 143 — එරන්දි (නිලධාරී)' },
      { username: 'sandareka', label: '140 — Sandareka (Officer) / 140 — සඳරේකා (නිලධාරී)' },
      { username: 'chathurika', label: '137 — Chathurika (Officer) / 137 — චතුරිකා (නිලධාරී)' },
      { username: 'prabhamili', label: '205 — Prabhamili (Officer) / 205 — ප්‍රභාමිලි (නිලධාරී)' },
    ],
  },
  head: {
    tab: 'Head of Department / දෙපාර්තමේන්තු ප්‍රධානියා',
    badge: 'View-only (All Letters & Dashboards) / බැලීම පමණි (සියලු ලිපි හා පුවරු)',
    badgeClass: 'badge-head',
    users: [
      { username: 'hod', label: '152 — Head of Department / 152 — දෙපාර්තමේන්තු ප්‍රධානියා' },
    ],
  },
  secretary: {
    tab: 'Addl. Secretary / අතිරේක ලේකම්',
    badge: 'Category-Specific View & Reply Only / කාණ්ඩයට සීමිත බැලීම හා පිළිතුරු පමණි',
    badgeClass: 'badge-secretary',
    users: [
      { username: 'sec-admin', label: 'Addl. Sec. (Administration) / අති. ලේක. (පරිපාලන)' },
      { username: 'sec-dev', label: 'Addl. Sec. (Development) / අති. ලේක. (සංවර්ධන)' },
      { username: 'sec-eng', label: 'Addl. Sec. (Engineering) / අති. ලේක. (ඉංජිනේරු)' },
      { username: 'sec-slacs', label: 'Addl. Sec. (SLAcS - Special) / අති. ලේක. (විශේෂ)' },
      { username: 'sec-slps', label: 'Addl. Sec. (SLPS - Special) / අති. ලේක. (විශේෂ ව්‍යාපෘති)' },
      { username: 'sec-special', label: 'Addl. Sec. (Special Projects) / අති. ලේක. (විශේෂ ව්‍යාපෘති)' },
    ],
  },
  admin: {
    tab: 'System Admin / පද්ධති පරිපාලක',
    badge: 'User Administration Only / පරිශීලක පරිපාලනය පමණි',
    badgeClass: 'badge-admin',
    users: [
      { username: 'admin', label: 'admin — System Admin / පද්ධති පරිපාලක' },
    ],
  },
};

const ROLE_ORDER = ['officer', 'head', 'secretary', 'admin'];

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState('officer');
  const [username, setUsername] = useState(ROLE_GROUPS.officer.users[0].username);
  const [password, setPassword] = useState(DEFAULT_PASSWORD);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const { lang, setLang, pick, t } = useLanguage();
  const navigate = useNavigate();

  const switchLoginGroup = (role) => {
    setActiveRole(role);
    setUsername(ROLE_GROUPS[role].users[0].username);
    setPassword(DEFAULT_PASSWORD);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role === 'admin') navigate('/users');
      else if (user.role === 'secretary') navigate('/secretary-inbox');
      else navigate('/dashboard');
      showToast(t('Welcome to RLMS', 'RLMS වෙත සාදරයෙන් පිළිගනිමු'));
    } catch (err) {
      showToast(err.response?.data?.message || t('Login failed', 'පිවිසීම අසාර්ථකයි'), 'error');
    } finally {
      setLoading(false);
    }
  };

  const group = ROLE_GROUPS[activeRole];

  return (
    <div id="login-screen" className="screen active login-page">
      <div className="login-background-overlay" />
      <div className="login-card-container">
        <div className="btn-group-toggle login-lang-toggle">
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
            සි
          </button>
        </div>
        <div className="login-header">
          <h1 className="login-title">{t('Sri Lanka Railways Department', 'ලංකා දුම්රිය දෙපාර්තමේන්තුව')}</h1>
          <h2 className="login-subtitle">{t('SRI LANKA RAILWAYS', 'ශ්‍රී ලංකා දුම්රිය')}</h2>
          <div className="login-divider" />
          <p className="login-app-name">{t('Letter Management System (RLMS)', 'ලිපි කළමනාකරණ පද්ධතිය (RLMS)')}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-role-selection">
            <label className="field-label">
              {pick('SELECT IDENTITY TO SIGN IN / පුරනය වීමට අනන්‍යතාවය තෝරන්‍න')}
            </label>

            <div className="identity-group-tabs">
              {ROLE_ORDER.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`role-tab ${activeRole === role ? 'active' : ''}`}
                  onClick={() => switchLoginGroup(role)}
                >
                  {pick(ROLE_GROUPS[role].tab)}
                </button>
              ))}
            </div>

            <div className="group-select-pane active">
              <select key={`${activeRole}-${lang}`} value={username} onChange={(e) => setUsername(e.target.value)}>
                {group.users.map((u) => (
                  <option key={`${u.username}-${lang}`} value={u.username}>{pick(u.label)}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-field password-field">
            <label className="field-label" htmlFor="password-input">
              {pick('Password / මුරපදය')}
            </label>
            <div className="input-wrapper">
              <input
                id="password-input"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full-width" disabled={loading}>
            <span>{loading ? t('Signing in...', 'පුරනය වෙමින්...') : pick('Sign In to System / පද්‍ධතියට පිවිසෙන්‍න')}</span>
            <span className="arrow">→</span>
          </button>
        </form>

        <div className="login-footer">
          <p>{t('Railway LMS Security Gate • Authorized Personnel Only', 'දුම්රිය LMS ආරක්ෂක දොරටුව • අවසර ලත් පිරිසට පමණි')}</p>
        </div>
      </div>
    </div>
  );
}
