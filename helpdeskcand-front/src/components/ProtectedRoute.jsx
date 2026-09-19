import { Navigate, Outlet } from 'react-router-dom';

export default function ProtectedRoute({ allowedRoles }) {
  const token = localStorage.getItem('token');
  let user = null;
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('usuario');
    user = raw ? JSON.parse(raw) : null;
  } catch {
    user = null;
  }

  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  const role = user.perfil || user.role;

  if (allowedRoles && !allowedRoles.includes(role)) {
    if (role === 'SETOR_ADMINISTRATIVO') return <Navigate to="/admin" replace />;
    if (role === 'USUARIO_COMUM') return <Navigate to="/usuario" replace />;
    return <Navigate to="/atendimento" replace />;
  }

  return <Outlet />;
}