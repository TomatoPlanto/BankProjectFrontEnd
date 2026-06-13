import { get, post, put } from '../utils/api.js';

export const accountService = {
    async getAllAccounts(token) {
        const response = await get('/api/accounts', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch accounts');
        return response.json();
    },

    async getAccountById(token, accountId) {
        const response = await get(`/api/accounts/${accountId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch account');
        return response.json();
    },

    async getAccountByIban(token, iban) {
        const response = await get(`/api/accounts/iban/${encodeURIComponent(iban)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('IBAN not found');
        return response.json();
    },

    async getAccountsByUserId(token, userId) {
        const response = await get(`/api/accounts/user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch accounts');
        return response.json();
    },

    async createAccount(token, accountData) {
        const response = await post('/api/accounts', accountData, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to create account');
        return response.json();
    },

    async updateLimits(token, accountId, limits) {
        const response = await put(`/api/accounts/${accountId}/limits`, limits, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to update limits');
        return response.json();
    },

    async closeAccount(token, accountId) {
        const response = await put(`/api/accounts/${accountId}/close`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to close account');
        return response.json();
    },
};