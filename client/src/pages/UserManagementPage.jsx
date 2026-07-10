import { useEffect, useState } from 'react';
import Header from '../components/Header';
import Loading from '../components/Loading';
import { usersApi } from '../api';
import { useToast } from '../context/ToastContext';

const SECRETARY_CATEGORIES = [
  'Additional Secretaries - Administration',
  'Additional Secretaries - Development',
  'Additional Secretaries - Engineering',
  'Additional Secretaries - SLAcS Special',
  'Additional Secretaries - SLPS Special',
  'Additional Secretaries - Special Projects',
];

export default function UserManagementPage() {
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    username: '', password: 'Password@123', fullName: '', employeeId: '', designation: '', role: 'officer', secretaryCategory: '',
  });

  const load = () => {
    setLoading(true);
    usersApi.list({ search }).then(({ data }) => setUsers(data)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search]);

  const createUser = async (e) => {
    e.preventDefault();
    try {
      await usersApi.create(form);
      showToast('User created');
      setForm({ username: '', password: 'Password@123', fullName: '', employeeId: '', designation: '', role: 'officer', secretaryCategory: '' });
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const toggleActive = async (user) => {
    try {
      await usersApi.updateStatus(user._id, !user.isActive);
      showToast(user.isActive ? 'User deactivated' : 'User activated');
      load();
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  const resetPw = async (user) => {
    try {
      await usersApi.resetPassword(user._id, 'Password@123');
      showToast('Password reset to Password@123');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed', 'error');
    }
  };

  return (
    <>
      <Header title="User Management" search={search} onSearch={setSearch} />
      <div className="content-body">
        <div className="card">
          <div className="registration-layout-split">
            <div className="reg-form-card">
              <h4>Register New User</h4>
              <form onSubmit={createUser}>
                <div className="form-field"><label>Username</label><input required value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} /></div>
                <div className="form-field"><label>Password</label><input required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></div>
                <div className="form-field"><label>Full Name</label><input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} /></div>
                <div className="form-field"><label>Employee ID</label><input value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} /></div>
                <div className="form-field"><label>Designation</label><input value={form.designation} onChange={(e) => setForm({ ...form, designation: e.target.value })} /></div>
                <div className="form-field">
                  <label>Role</label>
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                    <option value="officer">Officer</option>
                    <option value="head">Head</option>
                    <option value="secretary">Secretary</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                {form.role === 'secretary' && (
                  <div className="form-field">
                    <label>Secretary Category</label>
                    <select value={form.secretaryCategory} onChange={(e) => setForm({ ...form, secretaryCategory: e.target.value })} required>
                      <option value="">Select</option>
                      {SECRETARY_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                )}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>Create User</button>
              </form>
            </div>

            <div className="reg-directory-card">
              <h4>Registered Users</h4>
              {loading ? <Loading /> : (
                <div className="table-scroll-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>Username</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Category</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((u) => (
                        <tr key={u._id}>
                          <td>{u.username}</td>
                          <td>{u.fullName}</td>
                          <td>{u.role}</td>
                          <td>{u.secretaryCategory || '-'}</td>
                          <td>{u.isActive ? 'Active' : 'Inactive'}</td>
                          <td>
                            <button type="button" className="btn btn-outline btn-sm" onClick={() => toggleActive(u)}>
                              {u.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            <button type="button" className="btn btn-secondary btn-sm" onClick={() => resetPw(u)}>Reset PW</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
