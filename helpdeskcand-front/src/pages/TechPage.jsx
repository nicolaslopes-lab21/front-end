import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import chamadoService from '../services/chamadoService';
import authService from '../services/authService';

export default function TechPage() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => authService.getCurrentUser() || {});

  const [tickets, setTickets] = useState([]);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalAbertos: 0,
    totalResolvidos: 0,
    totalAtrasados: 0,
    totalHoje: 0
  });

  const [activeFilter, setActiveFilter] = useState('TODOS'); // TODOS, ABERTO, PENDENTE, FECHADO, ATRASADO
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [modalType, setModalType] = useState(null); // 'RESOLVER' | 'TRANSFERIR'
  const [solutionText, setSolutionText] = useState('');
  const [selectedTargetLevel, setSelectedTargetLevel] = useState('');
  const [feedback, setFeedback] = useState({ type: '', text: '' });

  // Perfil do atendente: ATENDENTE_N1, ATENDENTE_N2, ATENDENTE_N3
  const userPerfil = currentUser.perfil || currentUser.role || 'ATENDENTE_N1';
  const currentLevelLabel = userPerfil.replace('ATENDENTE_', '');

  // Determina para quais níveis o atendente atual pode escalar
  const getAllowedEscalationLevels = () => {
    if (userPerfil === 'ATENDENTE_N1') {
      return ['ATENDENTE_N2', 'ATENDENTE_N3'];
    }
    if (userPerfil === 'ATENDENTE_N2') {
      return ['ATENDENTE_N3'];
    }
    return []; // ATENDENTE_N3 não pode escalar
  };

  const allowedLevels = getAllowedEscalationLevels();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      // Carrega métricas do dashboard da API
      try {
        const metrics = await chamadoService.obterDashboard();
        setDashboardMetrics(metrics);
      } catch (dashErr) {
        console.warn('Erro ao carregar dashboard:', dashErr);
      }

      // Carrega chamados da API
      const data = await chamadoService.listar();
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Erro ao carregar chamados:', err);
      setFeedback({ type: 'error', text: 'Não foi possível carregar a lista de chamados.' });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openResolveModal = (ticket) => {
    setSelectedTicket(ticket);
    setSolutionText('');
    setModalType('RESOLVER');
  };

  const openTransferModal = (ticket) => {
    setSelectedTicket(ticket);
    setSelectedTargetLevel(allowedLevels[0] || '');
    setModalType('TRANSFERIR');
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setModalType(null);
    setSolutionText('');
    setSelectedTargetLevel('');
  };

  const handleStartService = async (ticket) => {
    try {
      setActionLoading(true);
      await chamadoService.iniciarAtendimento(ticket.id, currentUser.id);
      setFeedback({ type: 'success', text: `Chamado ${ticket.protocolo || ticket.id} colocado em atendimento (PENDENTE).` });
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao iniciar atendimento.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmResolve = async () => {
    if (!solutionText.trim()) {
      alert('Escreva o relatório da solução técnica antes de fechar o chamado.');
      return;
    }

    try {
      setActionLoading(true);
      await chamadoService.concluir(selectedTicket.id, currentUser.id, solutionText.trim());
      setFeedback({ type: 'success', text: `Chamado ${selectedTicket.protocolo || selectedTicket.id} resolvido com sucesso!` });
      closeModal();
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao concluir o chamado.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmTransfer = async () => {
    if (!selectedTargetLevel) {
      alert('Selecione o nível de destino.');
      return;
    }

    try {
      setActionLoading(true);
      await chamadoService.escalonar(selectedTicket.id, selectedTargetLevel);
      setFeedback({
        type: 'success',
        text: `Chamado ${selectedTicket.protocolo || selectedTicket.id} transferido para ${selectedTargetLevel}!`
      });
      closeModal();
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao escalonar o chamado.';
      setFeedback({ type: 'error', text: msg });
    } finally {
      setActionLoading(false);
    }
  };

  // Filtragem dos chamados
  // Filtra por nível do atendente ou exibe se pertencer ao seu nível
  const nivelChamados = tickets.filter((t) => {
    // Se o chamado tem nivelAtendimento, compara com o perfil do atendente
    return !t.nivelAtendimento || t.nivelAtendimento === userPerfil;
  });

  const filteredTickets = nivelChamados.filter((t) => {
    if (activeFilter === 'TODOS') return true;
    return t.status === activeFilter;
  });

  const abertosCount = nivelChamados.filter((t) => t.status === 'ABERTO').length;
  const pendentesCount = nivelChamados.filter((t) => t.status === 'PENDENTE').length;
  const resolvidosCount = nivelChamados.filter((t) => t.status === 'FECHADO').length;
  const atrasadosCount = nivelChamados.filter((t) => t.status === 'ATRASADO').length;

  const formatDateTime = (isoDate) => {
    if (!isoDate) return '-';
    try {
      return new Date(isoDate).toLocaleString('pt-BR');
    } catch {
      return isoDate;
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#090d16', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <div
        style={{
          maxWidth: '1100px',
          margin: '0 auto',
          background: '#121824',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #1a2332',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
        }}
      >
        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2
              style={{
                margin: 0,
                letterSpacing: '1.5px',
                textTransform: 'uppercase',
                fontWeight: '800',
                color: '#00e5ff',
                textShadow: '0 0 10px rgba(0, 229, 255, 0.35)'
              }}
            >
              PAINEL DE ATENDIMENTO TÉCNICO
            </h2>
            <small style={{ color: '#94a3b8' }}>
              Operador: <strong>{currentUser.email}</strong> | Nível: <span style={{ color: '#38bdf8', fontWeight: 'bold' }}>{userPerfil}</span>
            </small>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              onClick={loadData}
              style={{
                padding: '0.5rem 1rem',
                background: '#1e293b',
                color: '#00e5ff',
                border: '1px solid #334155',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              🔄 Atualizar
            </button>
            <button
              onClick={() => {
                authService.logout();
                navigate('/');
              }}
              style={{
                padding: '0.5rem 1.2rem',
                background: '#dc3545',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontWeight: 'bold'
              }}
            >
              Sair
            </button>
          </div>
        </div>

        {/* Global Dashboard Metrics */}
        <div style={{ marginBottom: '1.5rem', padding: '1rem', background: '#0b101b', borderRadius: '8px', border: '1px solid #222f43' }}>
          <small style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', display: 'block', marginBottom: '0.75rem' }}>
            Métricas Gerais do Sistema (API Dashboard):
          </small>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: '#162032', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Abertos</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#f59e0b' }}>{dashboardMetrics.totalAbertos}</div>
            </div>
            <div style={{ background: '#162032', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Resolvidos</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#10b981' }}>{dashboardMetrics.totalResolvidos}</div>
            </div>
            <div style={{ background: '#162032', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Atrasados</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#ef4444' }}>{dashboardMetrics.totalAtrasados}</div>
            </div>
            <div style={{ background: '#162032', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Hoje</span>
              <div style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#00e5ff' }}>{dashboardMetrics.totalHoje}</div>
            </div>
          </div>
        </div>

        {/* Feedback alert */}
        {feedback.text && (
          <div
            style={{
              padding: '0.85rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              background: feedback.type === 'error' ? '#7f1d1d' : '#065f46',
              color: '#fff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <span>{feedback.text}</span>
            <button
              onClick={() => setFeedback({ type: '', text: '' })}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 'bold' }}
            >
              ✕
            </button>
          </div>
        )}

        {/* Filter Cards for Current Level */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
          <div
            onClick={() => setActiveFilter('TODOS')}
            style={{
              background: activeFilter === 'TODOS' ? '#1e293b' : '#0e1626',
              border: activeFilter === 'TODOS' ? '2px solid #00e5ff' : '1px solid #222f43',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <small style={{ fontWeight: 'bold', color: '#94a3b8' }}>Todos Fila {currentLevelLabel}</small>
            <h2 style={{ margin: '0.5rem 0 0 0', color: '#fff' }}>{nivelChamados.length}</h2>
          </div>

          <div
            onClick={() => setActiveFilter('ABERTO')}
            style={{
              background: activeFilter === 'ABERTO' ? '#1e293b' : '#0e1626',
              border: activeFilter === 'ABERTO' ? '2px solid #f59e0b' : '1px solid #222f43',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <small style={{ fontWeight: 'bold', color: '#f59e0b' }}>Abertos</small>
            <h2 style={{ margin: '0.5rem 0 0 0', color: '#f59e0b' }}>{abertosCount}</h2>
          </div>

          <div
            onClick={() => setActiveFilter('PENDENTE')}
            style={{
              background: activeFilter === 'PENDENTE' ? '#1e293b' : '#0e1626',
              border: activeFilter === 'PENDENTE' ? '2px solid #38bdf8' : '1px solid #222f43',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <small style={{ fontWeight: 'bold', color: '#38bdf8' }}>Em Atendimento</small>
            <h2 style={{ margin: '0.5rem 0 0 0', color: '#38bdf8' }}>{pendentesCount}</h2>
          </div>

          <div
            onClick={() => setActiveFilter('FECHADO')}
            style={{
              background: activeFilter === 'FECHADO' ? '#1e293b' : '#0e1626',
              border: activeFilter === 'FECHADO' ? '2px solid #10b981' : '1px solid #222f43',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <small style={{ fontWeight: 'bold', color: '#10b981' }}>Resolvidos</small>
            <h2 style={{ margin: '0.5rem 0 0 0', color: '#10b981' }}>{resolvidosCount}</h2>
          </div>

          <div
            onClick={() => setActiveFilter('ATRASADO')}
            style={{
              background: activeFilter === 'ATRASADO' ? '#1e293b' : '#0e1626',
              border: activeFilter === 'ATRASADO' ? '2px solid #ef4444' : '1px solid #222f43',
              padding: '1rem',
              borderRadius: '8px',
              textAlign: 'center',
              cursor: 'pointer'
            }}
          >
            <small style={{ fontWeight: 'bold', color: '#ef4444' }}>Atrasados (SLA)</small>
            <h2 style={{ margin: '0.5rem 0 0 0', color: '#ef4444' }}>{atrasadosCount}</h2>
          </div>
        </div>

        <h3 style={{ marginBottom: '1rem', color: '#00e5ff', fontSize: '1.1rem' }}>
          Chamados Atribuídos ao {userPerfil} ({activeFilter})
        </h3>

        {loading ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Carregando chamados...</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {filteredTickets.length === 0 ? (
              <div
                style={{
                  padding: '2.5rem',
                  textAlign: 'center',
                  background: '#0b101b',
                  borderRadius: '8px',
                  border: '1px dashed #222f43'
                }}
              >
                <p style={{ color: '#94a3b8', margin: 0 }}>
                  Nenhum chamado com status <strong>{activeFilter}</strong> na fila do {userPerfil}.
                </p>
              </div>
            ) : (
              filteredTickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    border: '1px solid #222f43',
                    padding: '1.25rem',
                    borderRadius: '8px',
                    background: '#0b101b',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div>
                      <strong style={{ fontSize: '1.05rem', color: '#00e5ff' }}>
                        {t.protocolo || `HD-${t.id}`}
                      </strong>
                      <span
                        style={{
                          marginLeft: '0.8rem',
                          background: '#162032',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: '#38bdf8'
                        }}
                      >
                        [{t.categoria}]
                      </span>
                      <span
                        style={{
                          marginLeft: '0.5rem',
                          background: '#162032',
                          padding: '0.2rem 0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          color: t.urgencia === 'CRITICO' ? '#ef4444' : t.urgencia === 'MEDIO' ? '#f59e0b' : '#10b981'
                        }}
                      >
                        Urgência: {t.urgencia}
                      </span>
                    </div>

                    <div>
                      <span
                        style={{
                          padding: '0.25rem 0.75rem',
                          borderRadius: '4px',
                          fontWeight: 'bold',
                          fontSize: '0.85rem',
                          background:
                            t.status === 'FECHADO'
                              ? 'rgba(16, 185, 129, 0.2)'
                              : t.status === 'PENDENTE'
                              ? 'rgba(56, 189, 248, 0.2)'
                              : t.status === 'ATRASADO'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'rgba(245, 158, 11, 0.2)',
                          color:
                            t.status === 'FECHADO'
                              ? '#10b981'
                              : t.status === 'PENDENTE'
                              ? '#38bdf8'
                              : t.status === 'ATRASADO'
                              ? '#ef4444'
                              : '#f59e0b',
                          border: '1px solid currentColor'
                        }}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: '0.9rem 0', color: '#e2e8f0', lineHeight: 1.5 }}>{t.descricao}</p>

                  {t.solucao && (
                    <div style={{ background: '#162032', borderLeft: '4px solid #10b981', padding: '0.75rem', borderRadius: '4px', margin: '0.75rem 0' }}>
                      <strong style={{ color: '#10b981' }}>Solução Técnica Registrada:</strong>
                      <p style={{ margin: '0.3rem 0 0 0', color: '#cbd5e1' }}>{t.solucao}</p>
                    </div>
                  )}

                  <div style={{ fontSize: '0.85rem', color: '#94a3b8', display: 'flex', gap: '1.5rem', flexWrap: 'wrap', margin: '0.75rem 0' }}>
                    <span>👤 Solicitante: <strong style={{ color: '#cbd5e1' }}>{t.usuarioEmail || 'Não informado'}</strong></span>
                    <span>📎 Anexo: <strong style={{ color: '#cbd5e1' }}>{t.caminhoAnexo || 'Nenhum'}</strong></span>
                    <span>⏳ Limite SLA: <strong style={{ color: '#cbd5e1' }}>{formatDateTime(t.dataLimiteSla)}</strong></span>
                    {t.atendenteEmail && <span>👨‍💻 Em atendimento por: <strong style={{ color: '#38bdf8' }}>{t.atendenteEmail}</strong></span>}
                  </div>

                  {t.status !== 'FECHADO' && (
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', borderTop: '1px solid #1e293b', paddingTop: '0.85rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
                      {t.status === 'ABERTO' && (
                        <button
                          onClick={() => handleStartService(t)}
                          disabled={actionLoading}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem'
                          }}
                        >
                          ▶ Iniciar Atendimento
                        </button>
                      )}

                      <button
                        onClick={() => openResolveModal(t)}
                        disabled={actionLoading}
                        style={{
                          padding: '0.5rem 1rem',
                          background: '#10b981',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: actionLoading ? 'not-allowed' : 'pointer',
                          fontWeight: 'bold',
                          fontSize: '0.85rem'
                        }}
                      >
                        ✓ Concluir Chamado
                      </button>

                      {allowedLevels.length > 0 ? (
                        <button
                          onClick={() => openTransferModal(t)}
                          disabled={actionLoading}
                          style={{
                            padding: '0.5rem 1rem',
                            background: '#f59e0b',
                            color: '#000',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: actionLoading ? 'not-allowed' : 'pointer',
                            fontWeight: 'bold',
                            fontSize: '0.85rem'
                          }}
                        >
                          ↗ Escalonar Chamado
                        </button>
                      ) : (
                        <span
                          style={{
                            fontSize: '0.8rem',
                            color: '#94a3b8',
                            background: '#162032',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '4px',
                            fontStyle: 'italic'
                          }}
                        >
                          🔒 Nível Máximo (ATENDENTE_N3 não pode ser escalonado)
                        </span>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal de Ação */}
        {modalType && selectedTicket && (
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              zIndex: 1000,
              padding: '1rem'
            }}
          >
            <div
              style={{
                background: '#121824',
                border: '1px solid #222f43',
                padding: '2rem',
                borderRadius: '8px',
                maxWidth: '480px',
                width: '100%',
                boxShadow: '0 8px 24px rgba(0,0,0,0.6)',
                color: '#fff'
              }}
            >
              {modalType === 'RESOLVER' ? (
                <>
                  <h3 style={{ marginTop: 0, color: '#00e5ff' }}>Concluir Chamado</h3>
                  <p style={{ margin: '0.5rem 0 1rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Protocolo: <strong style={{ color: '#fff' }}>{selectedTicket.protocolo || selectedTicket.id}</strong>
                  </p>

                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
                    Relatório da Solução Técnica (Enviado no Body):
                  </label>
                  <textarea
                    placeholder="Ex: Configuração de rede ajustada e serviço restabelecido com sucesso."
                    value={solutionText}
                    onChange={(e) => setSolutionText(e.target.value)}
                    rows={4}
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      boxSizing: 'border-box',
                      background: '#0b101b',
                      color: '#fff',
                      borderRadius: '6px',
                      border: '1px solid #222f43',
                      resize: 'vertical',
                      fontSize: '0.9rem',
                      marginBottom: '1.25rem'
                    }}
                  />

                  <button
                    onClick={handleConfirmResolve}
                    disabled={actionLoading}
                    style={{
                      padding: '0.75rem',
                      background: '#10b981',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      width: '100%',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}
                  >
                    {actionLoading ? 'Concluindo...' : 'Confirmar e Fechar Chamado'}
                  </button>
                </>
              ) : (
                <>
                  <h3 style={{ marginTop: 0, color: '#00e5ff' }}>Escalonar Chamado</h3>
                  <p style={{ margin: '0.5rem 0 1rem 0', color: '#94a3b8', fontSize: '0.9rem' }}>
                    Protocolo: <strong style={{ color: '#fff' }}>{selectedTicket.protocolo || selectedTicket.id}</strong>
                  </p>

                  <p style={{ fontSize: '0.9rem', color: '#cbd5e1', marginBottom: '1rem' }}>
                    Seu perfil atual é <strong>{userPerfil}</strong>. Selecione o novo nível de atendimento autorizado:
                  </p>

                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
                      NOVO NÍVEL
                    </label>
                    <select
                      value={selectedTargetLevel}
                      onChange={(e) => setSelectedTargetLevel(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '0.75rem',
                        background: '#0b101b',
                        color: '#fff',
                        border: '1px solid #222f43',
                        borderRadius: '6px',
                        outline: 'none'
                      }}
                    >
                      {allowedLevels.map((lvl) => (
                        <option key={lvl} value={lvl}>
                          {lvl}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={handleConfirmTransfer}
                    disabled={actionLoading}
                    style={{
                      padding: '0.75rem',
                      background: '#f59e0b',
                      color: '#000',
                      border: 'none',
                      borderRadius: '6px',
                      cursor: actionLoading ? 'not-allowed' : 'pointer',
                      width: '100%',
                      fontWeight: 'bold',
                      fontSize: '0.95rem'
                    }}
                  >
                    {actionLoading ? 'Escalonando...' : `Confirmar Escalonamento para ${selectedTargetLevel}`}
                  </button>
                </>
              )}

              <button
                onClick={closeModal}
                disabled={actionLoading}
                style={{
                  display: 'block',
                  margin: '1rem auto 0',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '0.9rem'
                }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}