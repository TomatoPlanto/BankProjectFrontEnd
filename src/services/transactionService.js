import { get, post } from '../utils/api.js';

export const transactionService = {
    async getAccountTransaction(token, getParam) {
        const response = await post('/api/transactions/account', getParam, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to get accounts transactions');
        return response.json();
    },

    async getTransactionById(token, transactionId) {
        const response = await get(`/api/transactions/${transactionId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch transaction');
        return response.json();
    },

    async createTransaction(token, transactionParam) {
        const response = await post('/api/transactions', transactionParam, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to create transaction');
        return response.json();
    }
};