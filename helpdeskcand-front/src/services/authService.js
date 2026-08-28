export const authService = {
    login: async (email) => {
    if (!email.endsWith('@helpdeskcand.com')) {
        throw new Error('Utilize seu e-mail corporativo (@helpdeskcand.com)');
    }
    return { token: 'fake-token-123', user: { email, role: 'UsuarioComum' } };
    },

    validateCode: async (code) => {
    if (code !== '123456') {
        throw new Error('Código de validação inválido');
    }
    return { success: true, message: 'Conta ativada com sucesso!' };
    }
};