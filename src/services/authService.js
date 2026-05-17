import { get, post } from '../utils/api.js';

export const authService = {
    async login(email, password) {
        const response = await post('/api/auth/login', { email, password });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Login failed');
        }
        return response.json();
    },

    async register(userData) {
        const response = await post('/api/users/register', userData);
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Registration failed');
        }
        return response.json();
    },
};