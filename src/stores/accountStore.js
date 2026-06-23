import { defineStore } from 'pinia';
import { accountService } from '../services/accountService.js';
import { useAuthStore } from './authStore.js';

export const useAccountStore = defineStore('account', {
    state: () => ({
        accounts: [],
        loading: false,
        error: '',
        success: '',
        // pagination
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
    }),

    actions: {
        async fetchAllAccounts(page = 0) {
            const authStore = useAuthStore();
            this.loading = true;
            this.error = '';
            try {
                const res = await accountService.getAllAccounts(authStore.token, page, this.size);
                this.accounts = res.content;
                this.page = res.number;
                this.totalPages = res.totalPages;
                this.totalElements = res.totalElements;

                // if we landed on a now-empty page (e.g. last account on the last page was
                // closed), step back to the real last page
                if (this.accounts.length === 0 && page > 0 && this.totalElements > 0) {
                    return this.fetchAllAccounts(Math.max(0, this.totalPages - 1));
                }
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
                await accountService.updateAccount(authStore.token, accountId, limits);
                this.success = 'Limits updated successfully';
                await this.fetchAllAccounts(this.page); // stay on the current page
            } catch (e) {
                this.error = e.message;
            }
        },

        async closeAccount(accountId) {
            const authStore = useAuthStore();
            this.error = '';
            this.success = '';
            try {
                await accountService.updateAccount(authStore.token, accountId, { status: 'CLOSED' });
                this.success = 'Account closed successfully';
                await this.fetchAllAccounts(this.page);
            } catch (e) {
                this.error = e.message;
            }
        },
    },
});