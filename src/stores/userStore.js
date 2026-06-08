import { defineStore } from 'pinia';
import { userService } from '../services/userService.js';
import { useAuthStore } from './authStore.js';

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
        loading: false,
        error: '',
    }),

    actions: {
        async fetchAllUsers() {
            const authStore = useAuthStore();
            this.loading = true;
            this.error = '';
            try {
                this.users = await userService.getAllUsers(authStore.token);
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },

        async approveUser(userId) {
            const authStore = useAuthStore();
            this.error = '';
            try {
                await userService.approveUser(authStore.token, userId);
                await this.fetchAllUsers();
            } catch (e) {
                this.error = e.message;
            }
        },

        async closeUser(userId) {
            const authStore = useAuthStore();
            this.error = '';
            try {
                await userService.closeUser(authStore.token, userId);
                await this.fetchAllUsers();
            } catch (e) {
                this.error = e.message;
            }
        },
    },
});