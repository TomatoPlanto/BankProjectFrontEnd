import { get, post } from '../utils/api.js';

export const transactionService = {
    async getTransactions(token, accountId, pageNumber, transactionsPerPage, sorting, sortingOrder, filter) {
        let uri = `/api/transactions?`;

        if(accountId != null) uri = uri + `accountId=${accountId}`;

        uri = uri + `&pageNumber=${pageNumber}&transactionsPerPage=${transactionsPerPage}&sorting=${sorting}&sortingOrder=${sortingOrder}`;

        if(filter != null){
            if(filter.iban != undefined && filter.iban != null){
                uri = uri + `&filterFromIban=${filter.iban}&filterToIban${filter.iban}`;
            }
            else{
                if(filter.fromIban != null) uri = uri + `&filterFromIban=${filter.fromIban}`;
                if(filter.toIban != null) uri = uri + `&filterToIban=${filter.toIban}`;
            }
        }

        if(filter.minAmount != null) uri = uri + `&filterMinAmount=${filter.minAmount}`;
        if(filter.maxAmount != null) uri = uri + `&filterMaxAmount=${filter.maxAmount}`;
        if(filter.equalAmount != null) uri = uri + `&filterEqualAmount=${filter.equalAmount}`;

        console.log(uri);

        let response = await get(uri, {
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