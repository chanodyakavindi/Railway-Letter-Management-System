import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const DEFAULT_PASSWORD = 'Password@123';

const ROLE_GROUPS = {
  officer: {
    tab: 'Department Officer',
    badge: 'Create/Edit Access (No Delete)',
    badgeClass: 'badge-officer',
    users: [
      { username: 'priyangani', label: '151 — Priyangani (Officer)' },
      { username: 'gayanthi', label: '135 — Gayanthi (Officer)' },
      { username: 'purnima', label: '142 — Purnima (Officer)' },
      { username: 'dulani', label: '141 — Dulani (Officer)' },
      { username: 'chathura', label: '144 — Chathura (Officer)' },
      { username: 'erandi', label: '143 — Erandi (Officer)' },
      { username: 'sandareka', label: '140 — Sandareka (Officer)' },
      { username: 'chathurika', label: '137 — Chathurika (Officer)' },
      { username: 'prabhamili', label: '205 — Prabhamili (Officer)' },
    ],
  },
  head: {
    tab: 'Head of Department',
    badge: 'View-only (All Letters & Dashboards)',
    badgeClass: 'badge-head',
    users: [
      { username: 'hod', label: '152 — Head of Department' },
    ],
  },
  secretary: {
    tab: 'Addl. Secretary',
    badge: 'Category-Specific View & Reply Only',
    badgeClass: 'badge-secretary',
    users: [
      { username: 'sec-admin', label: 'Addl. Sec. (Administration)' },
      { username: 'sec-dev', label: 'Addl. Sec. (Development)' },
      { username: 'sec-eng', label: 'Addl. Sec. (Engineering)' },
      { username: 'sec-slacs', label: 'Addl. Sec. (SLAcS - Special)' },
      { username: 'sec-slps', label: 'Addl. Sec. (SLPS - Special)' },
      { username: 'sec-special', label: 'Addl. Sec. (Special Projects)' },
    ],
  },
  admin: {
    tab: 'System Admin',
    badge: 'User Administration Only',
    badgeClass: 'badge-admin',
    users: [
      { username: 'admin', label: 'admin — System Admin' },
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
      showToast('Welcome to RLMS');
    } catch (err) {
      showToast(err.response?.data?.message || 'Login failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const group = ROLE_GROUPS[activeRole];

  return (
    <div id="login-screen" className="screen active">
      <div className="login-background-overlay" />
      <div className="login-card-container">
        <div className="login-header">
          <div className="railway-emblem">🚂</div>
          <h1 className="login-title">ලංකා දුම්‍රිය දෙපාර්‍තමේන්‍තුව</h1>
          <h2 className="login-subtitle">Sri Lanka Railways</h2>
          <div className="login-divider" />
          <p className="login-app-name">Letter Management System (RLMS)</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="login-role-selection">
            <label className="field-label">
              Select Identity to Sign In / පුරනය වීමට අනන්‍යතාවය තෝරන්‍න
            </label>

            <div className="identity-group-tabs">
              {ROLE_ORDER.map((role) => (
                <button
                  key={role}
                  type="button"
                  className={`role-tab ${activeRole === role ? 'active' : ''}`}
                  onClick={() => switchLoginGroup(role)}
                >
                  {ROLE_GROUPS[role].tab}
                </button>
              ))}
            </div>

            <div className="group-select-pane active">
              <select value={username} onChange={(e) => setUsername(e.target.value)}>
                {group.users.map((u) => (
                  <option key={u.username} value={u.username}>{u.label}</option>
                ))}
              </select>
              <span className={`role-badge ${group.badgeClass}`}>{group.badge}</span>
            </div>
          </div>

          <div className="form-field password-field">
            <label className="field-label" htmlFor="password-input">
              Credentials / මුරපදය (Auto-filled)
            </label>
            <div className="input-wrapper">
              <span className="input-icon" />
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
            <span>{loading ? 'Signing in...' : 'Sign In to System / පද්‍ධතියට පිවිසෙන්‍න'}</span>
            <span className="arrow">→</span>
          </button>
        </form>

        <div className="login-footer">
          <p>Railway LMS Security Gate • Authorized Personnel Only</p>
        </div>
      </div>
    </div>
  );
}
