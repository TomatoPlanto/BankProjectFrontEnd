import { get, post, patch } from '../utils/api.js';

export const accountService = {
    // backend returns a page object, use .content for the array
    async getAllAccounts(token, page = 0, size = 20) {
        const response = await get(`/api/accounts?page=${page}&size=${size}`, {
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

    // search recipients by name -> [{ accountId, iban, ownerName }]
    async searchByOwnerName(token, name) {
        const response = await get(`/api/accounts/search?name=${encodeURIComponent(name)}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Search failed');
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

    // send only the fields you want to change, e.g. { status: 'CLOSED' }
    async updateAccount(token, accountId, changes) {
        const response = await patch(`/api/accounts/${accountId}`, changes, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to update account');
        return response.json();
    },
};