import api from './api';
import usuarioService from './usuarioService';

export const ROLES = {
  USUARIO_COMUM: 'USUARIO_COMUM',
  SETOR_ADMINISTRATIVO: 'SETOR_ADMINISTRATIVO',
  ATENDENTE_N1: 'ATENDENTE_N1',
  ATENDENTE_N2: 'ATENDENTE_N2',
  ATENDENTE_N3: 'ATENDENTE_N3'
};

export const authService = {
  login: async (email, senha) => {
    if (!email || !email.trim()) {
      throw new Error('Por favor, informe seu e-mail corporativo.');
    }

    if (!email.toLowerCase().endsWith('@helpdeskcand.com')) {
      throw new Error('RN01: Acesso permitido apenas para e-mails corporativos (@helpdeskcand.com).');
    }

    if (!senha) {
      throw new Error('Por favor, informe sua senha.');
    }

    const response = await api.post('/usuarios/login', {
      email: email.trim(),
      senha
    });

    const { token, usuario } = response.data;

    // Normaliza objeto de usuário para compatibilidade com o front
    const normalizedUser = {
      ...usuario,
      role: usuario.perfil,
      name: usuario.cargo || (usuario.email ? usuario.email.split('@')[0] : 'Usuário'),
      emailConfirmed: !!usuario.emailConfirmado
    };

    localStorage.setItem('token', token);
    localStorage.setItem('usuario', JSON.stringify(usuario));
    localStorage.setItem('user', JSON.stringify(normalizedUser));

    return { token, usuario: normalizedUser };
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
    localStorage.removeItem('user');
  },

  getCurrentUser: () => {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch {
      return null;
    }
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  confirmarEmail: async (usuarioId) => {
    const usuarioAtualizado = await usuarioService.confirmarEmail(usuarioId);
    
    // Se o usuário confirmado for o usuário logado, atualiza o localStorage
    const current = authService.getCurrentUser();
    if (current && current.id === usuarioId) {
      const updatedUser = {
        ...current,
        ...usuarioAtualizado,
        role: usuarioAtualizado.perfil || current.role,
        emailConfirmed: true,
        emailConfirmado: true
      };
      localStorage.setItem('usuario', JSON.stringify(usuarioAtualizado));
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    }
    return usuarioAtualizado;
  }
};

export default authService;