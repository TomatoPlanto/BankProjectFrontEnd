import { get, put } from '../utils/api.js';

export const userService = {
    async getAllUsers(token) {
        const response = await get('/api/users', {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    async getUserById(token, userId) {
        const response = await get(`/api/users/${userId}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch user');
        return response.json();
    },

    async getUsersByStatus(token, status) {
        const response = await get(`/api/users/status/${status}`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch users');
        return response.json();
    },

    async approveUser(token, userId) {
        const response = await put(`/api/users/${userId}/approve`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to approve user');
        return response.json();
    },

    async closeUser(token, userId) {
        const response = await put(`/api/users/${userId}/close`, {}, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to close user');
        return response.json();
    },
};