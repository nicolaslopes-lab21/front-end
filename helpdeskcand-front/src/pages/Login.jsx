import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import Logo from '../components/logo';
import './login.css';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
        const response = await authService.login(email);
        localStorage.setItem('token', response.token);
        navigate('/chamados');
    } catch (err) {
        setError(err.message);
    }
    };

    return (
    <div className="login-container">
        <Logo />
        <form className="login-form" onSubmit={handleLogin}>
        <div className="input-row">
            <input 
            type="email" 
            placeholder="email@helpdeskcand.com" 
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            />
            <input 
            type="password" 
            placeholder="Senha" 
            className="login-input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            />
        </div>

        {error && <p style={{ color: '#ff4d4d', fontSize: '0.85rem' }}>{error}</p>}

        <button type="submit" className="login-button">
            Entrar
        </button>
        </form>
    </div>
    );
}