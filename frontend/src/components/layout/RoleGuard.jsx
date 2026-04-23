import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getHomePathForRole } from '../../utils/roleRouting';

export default function RoleGuard({ allowed, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!allowed.includes(user.role)) return <Navigate to={getHomePathForRole(user.role)} replace />;
  return children;
}
