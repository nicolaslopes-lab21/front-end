import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import usuarioService from '../services/usuarioService';
import authService from '../services/authService';
import './CompleteRegister.css';

export default function CompleteRegister() {
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();
  const [userId, setUserId] = useState(currentUser?.id || '');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!userId) {
      setError('Informe o ID do usuário para confirmação.');
      return;
    }

    try {
      setLoading(true);
      await usuarioService.confirmarEmail(userId);
      if (currentUser && currentUser.id === Number(userId)) {
        await authService.confirmarEmail(userId);
      }
      setMessage('E-mail confirmado com sucesso na API!');
      setTimeout(() => {
        navigate('/usuario');
      }, 1500);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || 'Erro ao confirmar e-mail.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '400px', margin: '4rem auto', textAlign: 'center', background: '#fff', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
      <h2>Confirmação de E-mail</h2>
      <p style={{ color: '#666' }}>Confirme sua conta corporativa para habilitar a abertura de chamados.</p>
      {message && <p style={{ color: 'green' }}>{message}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleConfirm} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginTop: '1rem' }}>
        <input
          type="number"
          placeholder="ID do Usuário"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          style={{ padding: '0.6rem', border: '1px solid #ccc', borderRadius: '4px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ padding: '0.6rem', background: '#10b981', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {loading ? 'Confirmando...' : 'Confirmar E-mail'}
        </button>
      </form>
    </div>
  );
}