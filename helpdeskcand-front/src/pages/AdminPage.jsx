import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import usuarioService from '../services/usuarioService';
import chamadoService from '../services/chamadoService';
import authService from '../services/authService';

export default function AdminPage() {
  const navigate = useNavigate();
  const [currentUser] = useState(() => authService.getCurrentUser() || {});

  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalAbertos: 0,
    totalResolvidos: 0,
    totalAtrasados: 0,
    totalHoje: 0
  });

  const [formData, setFormData] = useState({
    email: '',
    senha: '',
    setor: '',
    cargo: '',
    perfil: 'USUARIO_COMUM'
  });

  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    email: '',
    setor: '',
    cargo: '',
    perfil: 'USUARIO_COMUM'
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      setLoadingUsers(true);
      const [usersList, metrics] = await Promise.allSettled([
        usuarioService.listar(),
        chamadoService.obterDashboard()
      ]);

      if (usersList.status === 'fulfilled' && Array.isArray(usersList.value)) {
        setUsers(usersList.value);
      }
      if (metrics.status === 'fulfilled') {
        setDashboardMetrics(metrics.value);
      }
    } catch (err) {
      console.error('Erro ao buscar dados do painel:', err);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.email.trim().toLowerCase().endsWith('@helpdeskcand.com')) {
      setError('Erro RN01: O e-mail DEVE terminar estritamente com @helpdeskcand.com');
      return;
    }

    try {
      setSubmitting(true);
      await usuarioService.cadastrar({
        email: formData.email.trim(),
        senha: formData.senha,
        setor: formData.setor.trim(),
        cargo: formData.cargo.trim(),
        perfil: formData.perfil
      });

      setSuccess('Usuário cadastrado com sucesso!');
      setFormData({
        email: '',
        senha: '',
        setor: '',
        cargo: '',
        perfil: 'USUARIO_COMUM'
      });
      await loadData();
    } catch (err) {
      const msg =
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Erro ao cadastrar usuário na API.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmUserEmail = async (userId) => {
    try {
      await usuarioService.confirmarEmail(userId);
      setSuccess(`E-mail do usuário #${userId} confirmado com sucesso!`);
      await loadData();
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao confirmar e-mail.';
      setError(msg);
    }
  };

  const startEdit = (u) => {
    setEditingUser(u);
    setEditFormData({
      email: u.email,
      setor: u.setor || '',
      cargo: u.cargo || '',
      perfil: u.perfil || 'USUARIO_COMUM'
    });
  };

  const cancelEdit = () => {
    setEditingUser(null);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!editFormData.email.trim().toLowerCase().endsWith('@helpdeskcand.com')) {
      setError('Erro RN01: O e-mail DEVE terminar com @helpdeskcand.com');
      return;
    }

    try {
      setSubmitting(true);
      await usuarioService.atualizar(editingUser.id, {
        email: editFormData.email.trim(),
        setor: editFormData.setor.trim(),
        cargo: editFormData.cargo.trim(),
        perfil: editFormData.perfil
      });

      setSuccess(`Usuário #${editingUser.id} atualizado com sucesso!`);
      setEditingUser(null);
      await loadData();
    } catch (err) {
      const msg =
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Erro ao atualizar usuário na API.';
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/');
  };

  return (
    <div style={{ padding: '2rem', background: '#090d16', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <div
        style={{
          maxWidth: '1050px',
          margin: '0 auto',
          background: '#121824',
          padding: '2rem',
          borderRadius: '12px',
          border: '1px solid #1a2332',
          boxShadow: '0 4px 20px rgba(0,0,0,0.6)'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h2
              style={{
                letterSpacing: '1px',
                margin: 0,
                color: '#00e5ff',
                textTransform: 'uppercase',
                fontWeight: '800',
                textShadow: '0 0 10px rgba(0, 229, 255, 0.35)'
              }}
            >
              PAINEL ADMINISTRATIVO
            </h2>
            <small style={{ color: '#94a3b8' }}>
              Administrador: <strong>{currentUser.email}</strong> ({currentUser.cargo || 'Setor Administrativo'})
            </small>
          </div>
          <div style={{ display: 'flex', gap: '0.8rem' }}>
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
              onClick={handleLogout}
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

        {/* Dashboard de Chamados */}
        <div style={{ marginBottom: '2rem', padding: '1rem', background: '#0b101b', borderRadius: '8px', border: '1px solid #222f43' }}>
          <small style={{ color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', display: 'block', marginBottom: '0.75rem' }}>
            Visão Geral de Chamados (Dashboard API):
          </small>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '0.75rem' }}>
            <div style={{ background: '#162032', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total em Aberto</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>{dashboardMetrics.totalAbertos}</div>
            </div>
            <div style={{ background: '#162032', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Resolvidos</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>{dashboardMetrics.totalResolvidos}</div>
            </div>
            <div style={{ background: '#162032', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Total Atrasados</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#ef4444' }}>{dashboardMetrics.totalAtrasados}</div>
            </div>
            <div style={{ background: '#162032', padding: '0.75rem', borderRadius: '6px', textAlign: 'center' }}>
              <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Abertos Hoje</span>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#00e5ff' }}>{dashboardMetrics.totalHoje}</div>
            </div>
          </div>
        </div>

        {error && (
          <div style={{ background: '#7f1d1d', color: '#fff', padding: '0.8rem', borderRadius: '6px', marginBottom: '1.2rem' }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: '#065f46', color: '#fff', padding: '0.8rem', borderRadius: '6px', marginBottom: '1.2rem' }}>
            {success}
          </div>
        )}

        {/* Formulário de Cadastro */}
        <div style={{ background: '#0b101b', padding: '1.5rem', borderRadius: '8px', border: '1px solid #222f43', marginBottom: '2rem' }}>
          <h3 style={{ margin: '0 0 1rem 0', color: '#00e5ff', fontSize: '1.15rem' }}>Cadastrar Novo Usuário</h3>
          <form onSubmit={handleRegister} style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                E-mail Corporativo (@helpdeskcand.com)
              </label>
              <input
                type="email"
                placeholder="nome@helpdeskcand.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                style={{ width: '100%', padding: '0.6rem', background: '#162032', border: '1px solid #222f43', borderRadius: '4px', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                Senha
              </label>
              <input
                type="password"
                placeholder="Senha de acesso"
                value={formData.senha}
                onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                required
                style={{ width: '100%', padding: '0.6rem', background: '#162032', border: '1px solid #222f43', borderRadius: '4px', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                Setor
              </label>
              <input
                type="text"
                placeholder="Ex: TI, Suporte, RH"
                value={formData.setor}
                onChange={(e) => setFormData({ ...formData, setor: e.target.value })}
                required
                style={{ width: '100%', padding: '0.6rem', background: '#162032', border: '1px solid #222f43', borderRadius: '4px', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                Cargo
              </label>
              <input
                type="text"
                placeholder="Ex: Atendente N1, Analista"
                value={formData.cargo}
                onChange={(e) => setFormData({ ...formData, cargo: e.target.value })}
                required
                style={{ width: '100%', padding: '0.6rem', background: '#162032', border: '1px solid #222f43', borderRadius: '4px', color: '#fff', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                Perfil de Acesso
              </label>
              <select
                value={formData.perfil}
                onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
                style={{ width: '100%', padding: '0.6rem', background: '#162032', border: '1px solid #222f43', borderRadius: '4px', color: '#fff', boxSizing: 'border-box' }}
              >
                <option value="USUARIO_COMUM">USUARIO_COMUM (Abre chamados)</option>
                <option value="ATENDENTE_N1">ATENDENTE_N1 (Atende Software / Escala para N2/N3)</option>
                <option value="ATENDENTE_N2">ATENDENTE_N2 (Atende Hardware e Software / Escala para N3)</option>
                <option value="ATENDENTE_N3">ATENDENTE_N3 (Nível Máximo de Atendimento Especializado)</option>
                <option value="SETOR_ADMINISTRATIVO">SETOR_ADMINISTRATIVO (Gestão de Usuários e Métricas)</option>
              </select>
            </div>

            <div style={{ gridColumn: '1 / -1' }}>
              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  background: '#6f42c1',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  fontWeight: 'bold',
                  fontSize: '0.95rem'
                }}
              >
                {submitting ? 'Cadastrando Usuário...' : 'Cadastrar Usuário na API'}
              </button>
            </div>
          </form>
        </div>

        {/* Modal/Formulário de Edição */}
        {editingUser && (
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
            <div style={{ background: '#121824', border: '1px solid #222f43', padding: '2rem', borderRadius: '8px', maxWidth: '500px', width: '100%' }}>
              <h3 style={{ marginTop: 0, color: '#00e5ff' }}>Editar Usuário #{editingUser.id}</h3>
              <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                    E-mail Corporativo
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.6rem', background: '#0b101b', border: '1px solid #222f43', borderRadius: '4px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                    Setor
                  </label>
                  <input
                    type="text"
                    value={editFormData.setor}
                    onChange={(e) => setEditFormData({ ...editFormData, setor: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.6rem', background: '#0b101b', border: '1px solid #222f43', borderRadius: '4px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                    Cargo
                  </label>
                  <input
                    type="text"
                    value={editFormData.cargo}
                    onChange={(e) => setEditFormData({ ...editFormData, cargo: e.target.value })}
                    required
                    style={{ width: '100%', padding: '0.6rem', background: '#0b101b', border: '1px solid #222f43', borderRadius: '4px', color: '#fff', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', color: '#38bdf8', marginBottom: '0.3rem', fontWeight: 'bold' }}>
                    Perfil
                  </label>
                  <select
                    value={editFormData.perfil}
                    onChange={(e) => setEditFormData({ ...editFormData, perfil: e.target.value })}
                    style={{ width: '100%', padding: '0.6rem', background: '#0b101b', border: '1px solid #222f43', borderRadius: '4px', color: '#fff', boxSizing: 'border-box' }}
                  >
                    <option value="USUARIO_COMUM">USUARIO_COMUM</option>
                    <option value="ATENDENTE_N1">ATENDENTE_N1</option>
                    <option value="ATENDENTE_N2">ATENDENTE_N2</option>
                    <option value="ATENDENTE_N3">ATENDENTE_N3</option>
                    <option value="SETOR_ADMINISTRATIVO">SETOR_ADMINISTRATIVO</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{ flex: 1, padding: '0.75rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Salvar Alterações
                  </button>
                  <button
                    type="button"
                    onClick={cancelEdit}
                    style={{ flex: 1, padding: '0.75rem', background: '#4b5563', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabela de Usuários Cadastrados */}
        <h3 style={{ margin: '0 0 1rem 0', color: '#00e5ff', fontSize: '1.15rem' }}>
          Usuários Cadastrados no Sistema (API /api/usuarios)
        </h3>

        {loadingUsers ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Carregando usuários da API...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0b101b', borderRadius: '8px', border: '1px solid #222f43' }}>
              <thead>
                <tr style={{ background: '#162032', textAlign: 'left', color: '#00e5ff', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>ID</th>
                  <th style={{ padding: '0.75rem 1rem' }}>E-mail</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Setor</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Cargo</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Perfil</th>
                  <th style={{ padding: '0.75rem 1rem' }}>E-mail Confirmado</th>
                  <th style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b' }}>
                      Nenhum usuário cadastrado.
                    </td>
                  </tr>
                ) : (
                  users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid #1e293b', fontSize: '0.9rem' }}>
                      <td style={{ padding: '0.75rem 1rem', color: '#94a3b8' }}>#{u.id}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#fff', fontWeight: 'bold' }}>{u.email}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>{u.setor || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem', color: '#cbd5e1' }}>{u.cargo || '-'}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ background: '#162032', color: '#38bdf8', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem' }}>
                          {u.perfil}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        {u.emailConfirmado ? (
                          <span style={{ color: '#10b981', fontWeight: 'bold', fontSize: '0.85rem' }}>✓ Sim</span>
                        ) : (
                          <span style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '0.85rem' }}>✕ Pendente</span>
                        )}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', textAlign: 'center', display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                        {!u.emailConfirmado && (
                          <button
                            onClick={() => handleConfirmUserEmail(u.id)}
                            style={{
                              padding: '0.3rem 0.6rem',
                              background: '#10b981',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '4px',
                              cursor: 'pointer',
                              fontSize: '0.75rem'
                            }}
                            title="Confirmar e-mail do usuário"
                          >
                            Validar E-mail
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(u)}
                          style={{
                            padding: '0.3rem 0.6rem',
                            background: '#0284c7',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Editar
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}