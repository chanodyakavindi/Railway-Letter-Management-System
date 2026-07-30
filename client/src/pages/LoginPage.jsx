import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { useLanguage } from '../context/LanguageContext';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { showToast } = useToast();
  const { lang, setLang, t } = useLanguage();
  const navigate = useNavigate();

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
              {t('Sign in with your account credentials', 'ඔබගේ ගිණුම් විස්තර භාවිතයෙන් පිවිසෙන්න')}
            </label>

            <div className="form-field login-text-field">
              <label className="field-label" htmlFor="username-input">
                {t('Username', 'පරිශීලක නාමය')}
              </label>
              <div className="input-wrapper">
                <input
                  id="username-input"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  autoComplete="username"
                  placeholder={t('Enter your username', 'ඔබගේ පරිශීලක නාමය ඇතුළත් කරන්න')}
                />
              </div>
            </div>

            <div className="form-field password-field">
              <label className="field-label" htmlFor="password-input">
                {t('Password', 'මුරපදය')}
              </label>
              <div className="input-wrapper">
                <input
                  id="password-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder={t('Enter your password', 'ඔබගේ මුරපදය ඇතුළත් කරන්න')}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-full-width" disabled={loading}>
            <span>{loading ? t('Signing in...', 'පුරනය වෙමින්...') : t('Sign In to System', 'පද්ධතියට පිවිසෙන්න')}</span>
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