import api from './api';

export const chamadoService = {
  // Cria um novo chamado. O autor é obtido pelo token JWT.
  criar: async ({ categoria, urgencia, descricao, caminhoAnexo }) => {
    const response = await api.post('/chamados', {
      categoria,
      urgencia,
      descricao,
      caminhoAnexo: caminhoAnexo || null
    });
    return response.data;
  },

  // Busca lista de chamados com filtros opcionais (status, nivelAtendimento, urgencia)
  listar: async (filtros = {}) => {
    const params = {};
    if (filtros.status) params.status = filtros.status;
    if (filtros.nivelAtendimento) params.nivelAtendimento = filtros.nivelAtendimento;
    if (filtros.urgencia) params.urgencia = filtros.urgencia;

    const response = await api.get('/chamados', { params });
    return response.data;
  },

  // Escalonar chamado para um novo nível (Requer Atendente N1, N2 ou N3)
  escalonar: async (id, novoNivel) => {
    const response = await api.put(`/chamados/${id}/escalonar`, null, {
      params: { novoNivel }
    });
    return response.data;
  },

  // Iniciar atendimento do chamado (coloca como PENDENTE)
  iniciarAtendimento: async (chamadoId, atendenteId) => {
    const response = await api.put(`/chamados/${chamadoId}/atender`, null, {
      params: {
        atendenteId,
        status: 'PENDENTE'
      }
    });
    return response.data;
  },

  // Concluir chamado (coloca como FECHADO e registra solução)
  concluir: async (chamadoId, atendenteId, solucaoTexto) => {
    const response = await api.put(
      `/chamados/${chamadoId}/atender`,
      solucaoTexto,
      {
        params: {
          atendenteId,
          status: 'FECHADO'
        },
        headers: {
          'Content-Type': 'text/plain'
        }
      }
    );
    return response.data;
  },

  // Obter métricas para dashboard (Requer Atendentes ou Administrador)
  obterDashboard: async () => {
    const response = await api.get('/chamados/dashboard');
    return response.data;
  }
};

export default chamadoService;
