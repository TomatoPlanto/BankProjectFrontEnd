import { get, post } from '../utils/api.js';

export const transactionService = {
    async getTransactions(token, accountId, pageNumber, transactionsPerPage, sorting, sortingOrder) {
        let response;

        if(accountId == null){
            response = await get(`/api/transactions?pageNumber=${pageNumber}&transactionsPerPage=${transactionsPerPage}&sorting=${sorting}&sortingOrder=${sortingOrder}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }
        else{
            response = await get(`/api/transactions?accountId=${accountId}&pageNumber=${pageNumber}&transactionsPerPage=${transactionsPerPage}&sorting=${sorting}&sortingOrder=${sortingOrder}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
        }
        
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