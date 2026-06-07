import { defineStore } from 'pinia';
import { transactionService } from '../services/transactionService.js';
import { useAuthStore } from './authStore.js';

export const useTransactionStore = defineStore('transaction', {
    state: () => ({
        users: [],
        loading: false,
        error: '',
    }),

    actions: {
        async fetchAccountTransactions() {
            const authStore = useAuthStore();
            this.loading = true;
            this.error = '';
            try {
                this.users = await transactionService.getAccountTransaction(authStore.token);
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