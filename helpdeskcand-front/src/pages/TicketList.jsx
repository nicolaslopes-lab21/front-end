import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import chamadoService from '../services/chamadoService';
import TicketFilter from '../components/TicketFilter';
import './TicketList.css';

export default function TicketList() {
  const [statusFilter, setStatusFilter] = useState('Todos');
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const loadTickets = useCallback(async () => {
    try {
      setLoading(true);
      const data = await chamadoService.listar();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao listar chamados:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  const handleEscalate = async (id, currentLevel) => {
    const nextLevel = currentLevel === 'ATENDENTE_N1' ? 'ATENDENTE_N2' : 'ATENDENTE_N3';
    try {
      await chamadoService.escalonar(id, nextLevel);
      await loadTickets();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Erro ao escalonar');
    }
  };

  const handleResolve = async (id) => {
    const solucao = prompt('Digite a solução do chamado:') || 'Resolvido pelo atendente.';
    try {
      await chamadoService.concluir(id, currentUser?.id, solucao);
      await loadTickets();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Erro ao fechar chamado');
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const userRole = currentUser?.perfil || currentUser?.role;
    if (userRole === 'USUARIO_COMUM') {
      if (ticket.usuarioEmail && ticket.usuarioEmail !== currentUser.email) return false;
    } else if (userRole && userRole.startsWith('ATENDENTE_')) {
      if (ticket.nivelAtendimento && ticket.nivelAtendimento !== userRole) return false;
    }

    if (statusFilter === 'Todos') return true;
    return ticket.status === statusFilter.toUpperCase();
  });

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '2rem' }}>
      <div className="ticket-list-container" style={{ maxWidth: '900px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h2>Fila de Chamados ({currentUser?.cargo || currentUser?.perfil})</h2>
          <span>Atendendo como: <strong>{currentUser?.email}</strong></span>
        </div>

        <TicketFilter onFilterChange={(status) => setStatusFilter(status)} />

        {loading ? (
          <p style={{ textAlign: 'center', marginTop: '1.5rem' }}>Carregando chamados...</p>
        ) : (
          <div className="tickets-grid" style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTickets.length === 0 ? (
              <p>Nenhum chamado nesta fila.</p>
            ) : (
              filteredTickets.map((ticket) => {
                const currentLevel = ticket.nivelAtendimento || 'ATENDENTE_N1';
                const userRole = currentUser?.perfil || currentUser?.role;

                return (
                  <div key={ticket.id} style={{ border: '1px solid #ddd', padding: '1rem', borderRadius: '6px', background: '#fafafa' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <strong>Protocolo: {ticket.protocolo || ticket.id}</strong>
                      <span>Nível: <strong>{currentLevel}</strong> | Status: <strong>{ticket.status}</strong></span>
                    </div>

                    <h4 style={{ margin: '0.5rem 0' }}>[{ticket.categoria}] - Urgência: {ticket.urgencia}</h4>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>👤 Solicitante: {ticket.usuarioEmail}</p>
                    <p style={{ margin: '0.2rem 0', fontSize: '0.9rem' }}>📝 Descrição: {ticket.descricao}</p>
                    {ticket.solucao && <p style={{ margin: '0.2rem 0', fontSize: '0.9rem', color: '#28a745' }}>✓ Solução: {ticket.solucao}</p>}

                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                      {ticket.status !== 'FECHADO' && userRole !== 'USUARIO_COMUM' && (
                        <>
                          <button
                            onClick={() => handleResolve(ticket.id)}
                            style={{ padding: '0.4rem 0.8rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          >
                            ✔ Resolver Chamado
                          </button>

                          {currentLevel !== 'ATENDENTE_N3' && (
                            <button
                              onClick={() => handleEscalate(ticket.id, currentLevel)}
                              style={{ padding: '0.4rem 0.8rem', backgroundColor: '#fd7e14', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                            >
                              Passar para {currentLevel === 'ATENDENTE_N1' ? 'N2' : 'N3'}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}

        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={handleLogout} style={{ padding: '0.5rem 1rem', background: '#6c757d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
          {currentUser?.perfil === 'USUARIO_COMUM' && (
            <button onClick={() => navigate('/usuario')} style={{ padding: '0.5rem 1rem', background: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>+ Novo Chamado</button>
          )}
        </div>
      </div>
    </div>
  );
}