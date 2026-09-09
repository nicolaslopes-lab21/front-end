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

    return (
    <div className="login-container">
        <div className="login-card">
        <h2>HelpDesk CAnd</h2>
        <p>Acesse o sistema com suas credenciais de usuário:</p>

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
        </div>
    </div>
    );
}