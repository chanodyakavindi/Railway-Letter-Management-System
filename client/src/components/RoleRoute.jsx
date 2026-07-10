import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function RoleRoute({ roles, children, redirectTo = '/dashboard' }) {
  const { hasRole } = useAuth();
  if (!hasRole(...roles)) return <Navigate to={redirectTo} replace />;
  return children;
}
