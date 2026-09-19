import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';
import './login.css';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (!email.trim().toLowerCase().endsWith('@helpdeskcand.com')) {
      setError('O e-mail corporativo deve pertencer ao domínio @helpdeskcand.com');
      return;
    }

    try {
      setLoading(true);
      const { usuario } = await authService.login(email.trim(), password);

      const perfil = usuario.perfil || usuario.role;

      if (perfil === 'SETOR_ADMINISTRATIVO') {
        navigate('/admin');
      } else if (perfil === 'USUARIO_COMUM') {
        navigate('/usuario');
      } else if (perfil && perfil.startsWith('ATENDENTE_')) {
        navigate('/atendimento');
      } else {
        navigate('/usuario');
      }
    } catch (err) {
      const mensagem =
        err.response?.data?.mensagem ||
        err.response?.data?.message ||
        err.response?.data?.error ||
        err.message ||
        'Falha ao autenticar. Verifique suas credenciais.';
      setError(mensagem);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h2
          style={{
            color: '#00e5ff',
            fontSize: '2.8rem',
            fontWeight: '900',
            fontFamily: "'Montserrat', 'Segoe UI', system-ui, sans-serif",
            letterSpacing: '3px',
            textTransform: 'uppercase',
            textShadow: '0 0 25px rgba(0, 229, 255, 0.75), 0 0 45px rgba(0, 229, 255, 0.35)',
            margin: '0 0 0.5rem 0',
            textAlign: 'center'
          }}
        >
          HelpDesk CAnd
        </h2>

        <p style={{ margin: '0 0 1.5rem 0', opacity: 0.85, textAlign: 'center' }}>
          Acesse o sistema com suas credenciais corporativas:
        </p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label
              style={{
                color: '#38bdf8',
                fontWeight: '700',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.4rem'
              }}
            >
              E-mail Corporativo
            </label>
            <input
              type="email"
              placeholder="seu.email@helpdeskcand.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label
              style={{
                color: '#38bdf8',
                fontWeight: '700',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'block',
                marginBottom: '0.4rem'
              }}
            >
              Senha
            </label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              autoComplete="current-password"
            />
          </div>

          <button
            type="submit"
            className="login-btn"
            disabled={loading}
            style={{
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
}