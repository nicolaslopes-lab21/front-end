import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import chamadoService from '../services/chamadoService';
import authService from '../services/authService';
import FileUpload from '../components/FileUpload';

export default function CreateTicket() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [formData, setFormData] = useState({
    categoria: 'SOFTWARE',
    urgencia: 'NORMAL',
    descricao: ''
  });
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!currentUser?.emailConfirmado && !currentUser?.emailConfirmed) {
      setError('Atenção: Seu e-mail precisa estar confirmado para abrir chamados.');
      return;
    }

    try {
      setLoading(true);
      await chamadoService.criar({
        categoria: formData.categoria,
        urgencia: formData.urgencia,
        descricao: formData.descricao,
        caminhoAnexo: file ? file.name : null
      });

      navigate('/usuario');
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao abrir chamado.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh', padding: '2rem' }}>
      <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '2rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2>Painel do Usuário - Abrir Chamado</h2>
          <button onClick={() => { authService.logout(); navigate('/'); }} style={{ padding: '0.4rem 0.8rem', background: '#dc3545', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>Sair</button>
        </div>

        <p style={{ marginBottom: '1rem', color: '#666' }}>
          Solicitante: <strong>{currentUser?.email}</strong> ({currentUser?.cargo || currentUser?.perfil})
        </p>

        {error && <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Categoria</label>
            <select
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="SOFTWARE">SOFTWARE (Fila N1)</option>
              <option value="HARDWARE">HARDWARE (Fila N2 direto)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Urgência</label>
            <select
              value={formData.urgencia}
              onChange={(e) => setFormData({ ...formData, urgencia: e.target.value })}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="NORMAL">NORMAL (SLA: 3h)</option>
              <option value="MEDIO">MÉDIO (SLA: 2h)</option>
              <option value="CRITICO">CRÍTICO (SLA: 1h)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 'bold', marginBottom: '0.3rem' }}>Descrição Detalhada</label>
            <textarea
              rows="4"
              placeholder="Descreva o problema em detalhes..."
              value={formData.descricao}
              onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
              required
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>

          <FileUpload onFileSelect={(selectedFile) => setFile(selectedFile)} />

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
            <button type="button" onClick={() => navigate('/usuario')} style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc', cursor: 'pointer' }}>Voltar</button>
            <button type="submit" disabled={loading} style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: 'none', backgroundColor: '#007bff', color: '#fff', fontWeight: 'bold', cursor: 'pointer' }}>
              {loading ? 'Abrindo...' : 'Abrir Chamado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}