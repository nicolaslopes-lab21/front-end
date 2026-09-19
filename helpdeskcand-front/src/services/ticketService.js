import chamadoService from './chamadoService';

export const ticketService = {
  createTicket: async (ticketData) => {
    return await chamadoService.criar(ticketData);
  },

  listTickets: async (filtros) => {
    return await chamadoService.listar(filtros);
  },

  resolveTicket: async (id, atendenteId, solucao) => {
    return await chamadoService.concluir(id, atendenteId, solucao);
  },

  escalateTicket: async (id, novoNivel) => {
    return await chamadoService.escalonar(id, novoNivel);
  }
};

export default ticketService;