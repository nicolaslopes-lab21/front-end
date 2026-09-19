import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import chamadoService from '../services/chamadoService';
import authService from '../services/authService';

export default function UserPage() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(() => authService.getCurrentUser() || {});

  const [tickets, setTickets] = useState([]);
  const [loadingTickets, setLoadingTickets] = useState(false);

  const [formData, setFormData] = useState({
    categoria: 'SOFTWARE',
    urgencia: 'NORMAL',
    descricao: ''
  });
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [confirmingEmail, setConfirmingEmail] = useState(false);

  const isEmailConfirmed = !!(currentUser.emailConfirmado || currentUser.emailConfirmed);

  const fetchTickets = useCallback(async () => {
    try {
      setLoadingTickets(true);
      const data = await chamadoService.listar();
      // Filtra chamados do usuário logado se a API retornar todos
      const userTickets = Array.isArray(data)
        ? data.filter((t) => !t.usuarioEmail || t.usuarioEmail === currentUser.email)
        : [];
      setTickets(userTickets);
    } catch (err) {
      console.error('Erro ao carregar chamados:', err);
    } finally {
      setLoadingTickets(false);
    }
  }, [currentUser.email]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      const allowedExtensions = ['.pdf', '.svg', '.png', '.jpg', '.jpeg'];
      const fileNameLower = selectedFile.name.toLowerCase();
      const hasValidExt = allowedExtensions.some((ext) => fileNameLower.endsWith(ext));

      if (!hasValidExt) {
        setFileError('Anexo inválido! Somente extensões .pdf, .svg, .png e .jpg são permitidas.');
        setFile(null);
        e.target.value = null;
      } else {
        setFileError('');
        setFile(selectedFile);
      }
    }
  };

  const handleConfirmEmail = async () => {
    if (!currentUser.id) {
      alert('Não foi possível identificar o ID do usuário para confirmação.');
      return;
    }
    try {
      setConfirmingEmail(true);
      const updated = await authService.confirmarEmail(currentUser.id);
      setCurrentUser(updated);
      setSuccessMessage('E-mail confirmado com sucesso! Agora você já pode abrir chamados.');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao confirmar e-mail.';
      setErrorMessage(msg);
    } finally {
      setConfirmingEmail(false);
    }
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!isEmailConfirmed) {
      setErrorMessage('Bloqueado: Seu e-mail precisa estar confirmado para abrir chamados.');
      return;
    }

    try {
      setSubmitting(true);
      const novoChamado = await chamadoService.criar({
        categoria: formData.categoria,
        urgencia: formData.urgencia,
        descricao: formData.descricao.trim(),
        caminhoAnexo: file ? file.name : null
      });

      setSuccessMessage(`Chamado aberto com sucesso! Protocolo: ${novoChamado.protocolo || novoChamado.id}`);
      setFormData({ categoria: 'SOFTWARE', urgencia: 'NORMAL', descricao: '' });
      setFile(null);

      // Atualiza lista de chamados
      fetchTickets();
    } catch (err) {
      const msg =
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Erro ao registrar chamado no sistema.';
      setErrorMessage(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const formatDateTime = (isoDate) => {
    if (!isoDate) return '-';
    try {
      return new Date(isoDate).toLocaleString('pt-BR');
    } catch {
      return isoDate;
    }
  };

  const getStatusBadgeStyle = (status) => {
    switch (status) {
      case 'FECHADO':
        return { background: 'rgba(16, 185, 129, 0.2)', color: '#10b981', border: '1px solid #10b981' };
      case 'PENDENTE':
        return { background: 'rgba(59, 130, 246, 0.2)', color: '#38bdf8', border: '1px solid #38bdf8' };
      case 'ATRASADO':
        return { background: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', border: '1px solid #ef4444' };
      case 'ABERTO':
      default:
        return { background: 'rgba(245, 158, 11, 0.2)', color: '#f59e0b', border: '1px solid #f59e0b' };
    }
  };

  return (
    <div style={{ padding: '2rem', background: '#090d16', minHeight: '100vh', color: '#fff', fontFamily: 'sans-serif' }}>
      <div
        style={{
          maxWidth: '960px',
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
                margin: 0,
                color: '#00e5ff',
                textTransform: 'uppercase',
                letterSpacing: '1.5px',
                fontWeight: '800',
                textShadow: '0 0 12px rgba(0, 229, 255, 0.4)'
              }}
            >
              PAINEL DO USUÁRIO
            </h2>
            <small style={{ color: '#94a3b8' }}>
              Logado como: <strong>{currentUser.email}</strong> ({currentUser.cargo || 'Usuário Comum'})
            </small>
          </div>
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

        {!isEmailConfirmed ? (
          <div
            style={{
              background: '#3b1219',
              border: '1px solid #7f1d1d',
              color: '#fca5a5',
              padding: '1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '1rem'
            }}
          >
            <div>
              <strong>Aviso Obrigatório:</strong> Seu e-mail ainda não foi confirmado. O sistema exige confirmação para abertura de chamados.
            </div>
            <button
              onClick={handleConfirmEmail}
              disabled={confirmingEmail}
              style={{
                padding: '0.5rem 1rem',
                background: '#10b981',
                color: '#fff',
                border: 'none',
                borderRadius: '5px',
                cursor: confirmingEmail ? 'not-allowed' : 'pointer',
                fontWeight: 'bold'
              }}
            >
              {confirmingEmail ? 'Confirmando...' : 'Confirmar E-mail Agora'}
            </button>
          </div>
        ) : (
          <div
            style={{
              background: 'rgba(16, 185, 129, 0.1)',
              border: '1px solid #10b98144',
              color: '#10b981',
              padding: '0.6rem 1rem',
              borderRadius: '6px',
              marginBottom: '1.5rem',
              fontSize: '0.9rem'
            }}
          >
            ✓ Conta verificada com sucesso.
          </div>
        )}

        {errorMessage && (
          <div style={{ background: '#7f1d1d', color: '#fff', padding: '0.8rem', borderRadius: '6px', marginBottom: '1.2rem' }}>
            {errorMessage}
          </div>
        )}

        {successMessage && (
          <div style={{ background: '#065f46', color: '#fff', padding: '0.8rem', borderRadius: '6px', marginBottom: '1.2rem' }}>
            {successMessage}
          </div>
        )}

        <h3
          style={{
            margin: '0 0 1.2rem 0',
            color: '#00e5ff',
            textTransform: 'uppercase',
            letterSpacing: '1.5px',
            fontWeight: '800',
            textShadow: '0 0 10px rgba(0, 229, 255, 0.35)',
            fontSize: '1.15rem'
          }}
        >
          ABRIR NOVO CHAMADO
        </h3>

        <form onSubmit={handleCreateTicket} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
                CATEGORIA
              </label>
              <select
                value={formData.categoria}
                onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#0b101b',
                  color: '#fff',
                  border: '1px solid #222f43',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              >
                <option value="SOFTWARE">SOFTWARE (Fila N1)</option>
                <option value="HARDWARE">HARDWARE (Fila N2 direto)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
                URGÊNCIA (SLA)
              </label>
              <select
                value={formData.urgencia}
                onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}
                style={{
                  width: '100%',
                  padding: '0.8rem',
                  background: '#0b101b',
                  color: '#fff',
                  border: '1px solid #222f43',
                  borderRadius: '6px',
                  outline: 'none'
                }}
              >
                <option value="NORMAL">NORMAL (Limite de 3 horas)</option>
                <option value="MEDIO">MÉDIO (Limite de 2 horas)</option>
                <option value="CRITICO">CRÍTICO (Limite de 1 hora)</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: '#38bdf8', fontWeight: 'bold' }}>
              DESCRIÇÃO DO PROBLEMA
            </label>
            <textarea
              placeholder="Descreva detalhadamente a falha ou solicitação..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
              rows={4}
              style={{
                width: '100%',
                padding: '0.8rem',
                background: '#0b101b',
                color: '#fff',
                border: '1px solid #222f43',
                borderRadius: '6px',
                outline: 'none',
                resize: 'vertical',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.85rem', color: '#94a3b8', fontWeight: '600' }}>
              Anexo (.pdf, .svg, .png, .jpg):
            </label>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                background: '#0b101b',
                border: '1px dashed #00e5ff55',
                padding: '0.75rem 1rem',
                borderRadius: '6px'
              }}
            >
              <label
                htmlFor="file-upload"
                style={{
                  padding: '0.45rem 1.1rem',
                  background: 'rgba(0, 229, 255, 0.1)',
                  color: '#00e5ff',
                  border: '1px solid #00e5ff',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 'bold'
                }}
              >
                📁 Escolher Arquivo
              </label>
              <input
                id="file-upload"
                type="file"
                accept=".pdf,.svg,.png,.jpg,.jpeg"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <span style={{ fontSize: '0.85rem', color: file ? '#00e5ff' : '#64748b', fontStyle: file ? 'normal' : 'italic' }}>
                {file ? `Arquivo selecionado: ${file.name}` : 'Nenhum arquivo escolhido'}
              </span>
            </div>
            {fileError && <p style={{ color: '#ef4444', fontSize: '0.85rem', marginTop: '0.4rem', margin: 0 }}>{fileError}</p>}
          </div>

          <button
            type="submit"
            disabled={!isEmailConfirmed || submitting}
            style={{
              padding: '0.85rem',
              background: isEmailConfirmed ? '#10b981' : '#4b5563',
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: isEmailConfirmed && !submitting ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              fontSize: '1rem',
              marginTop: '0.5rem',
              opacity: submitting ? 0.7 : 1
            }}
          >
            {submitting ? 'Enviando Chamado...' : 'Enviar Chamado'}
          </button>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
          <h3
            style={{
              margin: 0,
              color: '#00e5ff',
              textTransform: 'uppercase',
              letterSpacing: '1.5px',
              fontWeight: '800',
              textShadow: '0 0 10px rgba(0, 229, 255, 0.35)',
              fontSize: '1.15rem'
            }}
          >
            MEUS CHAMADOS
          </h3>
          <button
            onClick={fetchTickets}
            style={{
              padding: '0.4rem 0.8rem',
              background: '#1e293b',
              color: '#00e5ff',
              border: '1px solid #334155',
              borderRadius: '4px',
              cursor: 'pointer',
              fontSize: '0.8rem'
            }}
          >
            🔄 Atualizar Lista
          </button>
        </div>

        {loadingTickets ? (
          <p style={{ textAlign: 'center', color: '#94a3b8' }}>Carregando chamados...</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: '#0b101b', borderRadius: '8px', border: '1px solid #222f43' }}>
              <thead>
                <tr style={{ background: '#162032', textAlign: 'left', color: '#00e5ff', fontSize: '0.85rem' }}>
                  <th style={{ padding: '0.85rem 1rem' }}>PROTOCOLO</th>
                  <th style={{ padding: '0.85rem 1rem' }}>CATEGORIA</th>
                  <th style={{ padding: '0.85rem 1rem' }}>URGÊNCIA</th>
                  <th style={{ padding: '0.85rem 1rem' }}>NÍVEL</th>
                  <th style={{ padding: '0.85rem 1rem' }}>STATUS</th>
                  <th style={{ padding: '0.85rem 1rem' }}>LIMITE SLA</th>
                  <th style={{ padding: '0.85rem 1rem' }}>SOLUÇÃO</th>
                </tr>
              </thead>
              <tbody>
                {tickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ padding: '1.5rem', textAlign: 'center', color: '#64748b', fontSize: '0.9rem' }}>
                      Nenhum chamado aberto até o momento.
                    </td>
                  </tr>
                ) : (
                  tickets.map((t) => (
                    <tr key={t.id || t.protocolo} style={{ borderBottom: '1px solid #1e293b', fontSize: '0.9rem' }}>
                      <td style={{ padding: '0.85rem 1rem', color: '#fff', fontWeight: 'bold' }}>
                        {t.protocolo || `HD-${t.id}`}
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>{t.categoria}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#cbd5e1' }}>{t.urgencia}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{t.nivelAtendimento}</td>
                      <td style={{ padding: '0.85rem 1rem' }}>
                        <span
                          style={{
                            padding: '0.2rem 0.6rem',
                            borderRadius: '4px',
                            fontWeight: 'bold',
                            fontSize: '0.8rem',
                            ...getStatusBadgeStyle(t.status)
                          }}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.85rem 1rem', color: '#94a3b8' }}>{formatDateTime(t.dataLimiteSla)}</td>
                      <td style={{ padding: '0.85rem 1rem', color: '#10b981', fontSize: '0.85rem' }}>
                        {t.solucao || (t.status === 'FECHADO' ? 'Concluído' : '-')}
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