import api from './api';

export const usuarioService = {
  // Lista todos os usuários cadastrados (Requer SETOR_ADMINISTRATIVO)
  listar: async () => {
    const response = await api.get('/usuarios');
    return response.data;
  },

  // Cadastra um novo usuário (Requer SETOR_ADMINISTRATIVO)
  cadastrar: async (dadosUsuario) => {
    const response = await api.post('/usuarios/cadastrar', dadosUsuario);
    return response.data;
  },

  // Atualiza um usuário existente (Requer SETOR_ADMINISTRATIVO)
  atualizar: async (id, dadosAtualizados) => {
    const response = await api.put(`/usuarios/${id}`, dadosAtualizados);
    return response.data;
  },

  // Confirma a conta do usuário para permitir abertura de chamados (Público)
  confirmarEmail: async (id) => {
    const response = await api.put(`/usuarios/${id}/confirmar-email`);
    return response.data;
  }
};

export default usuarioService;
