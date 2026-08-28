let mockTickets = [];

export const ticketService = {
    createTicket: async (ticketData) => {
    const newTicket = {
      id: `HD-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        ...ticketData,
        status: 'Aberto',
        createdAt: new Date().toLocaleDateString()
    };
    mockTickets.push(newTicket);
    return newTicket;
    },

    getTickets: async () => {
    return mockTickets;
    }
};