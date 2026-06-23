import { defineStore } from 'pinia';
import { userService } from '../services/userService.js';
import { useAuthStore } from './authStore.js';

export const useUserStore = defineStore('user', {
    state: () => ({
        users: [],
        loading: false,
        error: '',
        // pagination
        page: 0,
        size: 10,
        totalPages: 0,
        totalElements: 0,
        // server-side status filter: null = ALL, otherwise 'PENDING' | 'ACTIVE' | 'CLOSED'
        status: null,
        // true while showing /search results (a plain List, not paged) -> hide the pager
        searching: false,
    }),

    actions: {
        async fetchAllUsers(page = 0) {
            const authStore = useAuthStore();
            this.loading = true;
            this.error = '';
            this.searching = false;
            try {
                const res = await userService.getAllUsers(authStore.token, page, this.size, this.status);
                this.users = res.content;
                this.page = res.number;
                this.totalPages = res.totalPages;
                this.totalElements = res.totalElements;

                // if we asked for a page that no longer exists (e.g. last row on the last
                // page got closed/filtered away), fall back to the real last page
                if (this.users.length === 0 && page > 0 && this.totalElements > 0) {
                    return this.fetchAllUsers(Math.max(0, this.totalPages - 1));
                }
            } catch (e) {
                this.error = e.message;
            } finally {
                this.loading = false;
            }
        },

        // called when a status tab is clicked; 'ALL' clears the filter
        setStatus(tab) {
            this.status = tab === 'ALL' ? null : tab;
            return this.fetchAllUsers(0);
        },

        async searchByName(name) {
            const authStore = useAuthStore();
            this.loading = true;
            this.error = '';
            this.searching = true;
            try {
                this.users = await userService.searchByName(authStore.token, name);
                this.totalPages = 0;
                this.totalElements = this.users.length;
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
                await this.fetchAllUsers(this.page); // stay on the page the employee was on
            } catch (e) {
                this.error = e.message;
            }
        },

        async closeUser(userId) {
            const authStore = useAuthStore();
            this.error = '';
            try {
                await userService.closeUser(authStore.token, userId);
                await this.fetchAllUsers(this.page);
            } catch (e) {
                this.error = e.message;
            }
        },
    },
});