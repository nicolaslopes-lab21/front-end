import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '../pages/Login';
import AdminPage from '../pages/AdminPage';
import UserPage from '../pages/UserPage';
import TechPage from '../pages/TechPage';
import Dashboard from '../pages/Dashboard';
import CreateTicket from '../pages/CreateTicket';
import TicketList from '../pages/TicketList';
import CompleteRegister from '../pages/CompleteRegister';
import ProtectedRoute from '../components/ProtectedRoute';

export default function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/confirmar-email" element={<CompleteRegister />} />

        {/* Rota do Setor Administrativo */}
        <Route element={<ProtectedRoute allowedRoles={['SETOR_ADMINISTRATIVO']} />}>
          <Route path="/admin" element={<AdminPage />} />
        </Route>

        {/* Rota do Usuário Comum */}
        <Route element={<ProtectedRoute allowedRoles={['USUARIO_COMUM']} />}>
          <Route path="/usuario" element={<UserPage />} />
          <Route path="/novo-chamado" element={<CreateTicket />} />
        </Route>

        {/* Rota dos Atendentes Técnicos */}
        <Route element={<ProtectedRoute allowedRoles={['ATENDENTE_N1', 'ATENDENTE_N2', 'ATENDENTE_N3']} />}>
          <Route path="/atendimento" element={<TechPage />} />
        </Route>

        {/* Rotas compartilhadas */}
        <Route element={<ProtectedRoute allowedRoles={['SETOR_ADMINISTRATIVO', 'ATENDENTE_N1', 'ATENDENTE_N2', 'ATENDENTE_N3']} />}>
          <Route path="/dashboard" element={<Dashboard />} />
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['USUARIO_COMUM', 'ATENDENTE_N1', 'ATENDENTE_N2', 'ATENDENTE_N3']} />}>
          <Route path="/chamados" element={<TicketList />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}