import { defineStore } from 'pinia';
import { accountService } from '../services/accountService.js';
import { useAuthStore } from './authStore.js';

export const useAccountStore = defineStore('account', {
    state: () => ({
        accounts: [],
        loading: false,
        error: '',
        success: '',
    }),

    actions: {
        async fetchAllAccounts() {
            const authStore = useAuthStore();
            this.loading = true;
            this.error = '';
            try {
                this.accounts = await accountService.getAllAccounts(authStore.token);
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },

        async fetchAccountsByUser(userId) {
            const authStore = useAuthStore();
            this.loading = true;
            this.error = '';
            try {
                this.accounts = await accountService.getAccountsByUserId(authStore.token, userId);
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },

        async updateLimits(accountId, limits) {
            const authStore = useAuthStore();
            this.error = '';
            this.success = '';
            try {
                await accountService.updateLimits(authStore.token, accountId, limits);
                this.success = 'Limits updated successfully';
                await this.fetchAllAccounts();
            } catch (e) {
                this.error = e.message;
            }
        },

        async closeAccount(accountId) {
            const authStore = useAuthStore();
            this.error = '';
            this.success = '';
            try {
                await accountService.closeAccount(authStore.token, accountId);
                this.success = 'Account closed successfully';
                await this.fetchAllAccounts();
            } catch (e) {
                this.error = e.message;
            }
        },
    },
});