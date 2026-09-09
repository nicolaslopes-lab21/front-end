import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './login.css';

export default function Login() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [cargo, setCargo] = useState('');
    const [error, setError] = useState('');

    const redirectByRole = (role, userEmail = email) => {
    const userData = {
        email: userEmail,
        role: role,
        token: 'jwt_mock_token_' + Date.now(),
        emailConfirmed: true
    };

    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', userData.token);

    if (role === 'SETOR_ADMINISTRATIVO') navigate('/admin');
    else if (role === 'USUARIO_COMUM') navigate('/usuario');
    else navigate('/atendimento');
    };

    const handleLogin = (e) => {
    e.preventDefault();
    setError('');

    if (!cargo) {
        setError('A seleção do cargo é obrigatória para prosseguir.');
        return;
    }

    if (!email.endsWith('@helpdeskcand.com')) {
        setError('O e-mail deve pertencer ao domínio @helpdeskcand.com');
        return;
    }

    redirectByRole(cargo, email);
    };

    const handleQuickLogin = (role, defaultEmail) => {
    redirectByRole(role, defaultEmail);
    };

    return (
    <div className="login-container">
        <div className="login-card">
        <h2>HelpDesk CAnd</h2>
        <p>Acesse o sistema com suas credenciais ou escolha um perfil de teste:</p>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleLogin}>
            <div className="form-group">
            <label>E-mail Corporativo</label>
            <input
                type="email"
                placeholder="seu.email@helpdeskcand.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
            />
            </div>

            <div className="form-group">
            <label>Senha</label>
            <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
            />
            </div>

            <div className="form-group">
            <label>Selecione seu Cargo *</label>
            <select
                value={cargo}
                onChange={(e) => setCargo(e.target.value)}
                required
                style={{ width: '100%', padding: '0.6rem', borderRadius: '4px', border: '1px solid #444', backgroundColor: '#2b2b3d', color: '#fff' }}
            >
                <option value="">-- Selecione o Cargo --</option>
                <option value="SETOR_ADMINISTRATIVO">Setor Administrativo</option>
                <option value="ATENDENTE_N1">Atendente N1</option>
                <option value="ATENDENTE_N2">Atendente N2</option>
                <option value="ATENDENTE_N3">Atendente N3</option>
                <option value="USUARIO_COMUM">Usuário Comum</option>
            </select>
            </div>

            <button type="submit" className="login-btn">Entrar</button>
        </form>

        <div style={{ marginTop: '1.5rem', borderTop: '1px solid #444', paddingTop: '1rem', textAlign: 'center' }}>
            <p style={{ fontSize: '0.85rem', marginBottom: '0.75rem', color: '#aaa' }}>Acesso Rápido por Perfil:</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button
                type="button"
                onClick={() => handleQuickLogin('SETOR_ADMINISTRATIVO', 'admin@helpdeskcand.com')}
                style={{ padding: '0.55rem', backgroundColor: '#6f42c1', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                👑 Setor Administrativo (Cadastrar Usuários)
            </button>
            <button
                type="button"
                onClick={() => handleQuickLogin('ATENDENTE_N1', 'n1@helpdeskcand.com')}
                style={{ padding: '0.55rem', backgroundColor: '#007bff', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                🛠️ Atendente N1 (Resolver/Escalar Chamados)
            </button>
            <button
                type="button"
                onClick={() => handleQuickLogin('ATENDENTE_N2', 'n2@helpdeskcand.com')}
                style={{ padding: '0.55rem', backgroundColor: '#17a2b8', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                🛠️ Atendente N2 (Resolver/Escalar Chamados)
            </button>
            <button
                type="button"
                onClick={() => handleQuickLogin('ATENDENTE_N3', 'n3@helpdeskcand.com')}
                style={{ padding: '0.55rem', backgroundColor: '#fd7e14', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                🛠️ Atendente N3 (Resolver Chamados Finais)
            </button>
            <button
                type="button"
                onClick={() => handleQuickLogin('USUARIO_COMUM', 'usuario@helpdeskcand.com')}
                style={{ padding: '0.55rem', backgroundColor: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
            >
                👤 Usuário Comum (Abrir Chamados)
            </button>
            </div>
        </div>
        </div>
    </div>
    );
}