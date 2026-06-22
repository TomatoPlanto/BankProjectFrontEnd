<template>
    <aside class="sidebar">
        <div class="brand">
            <div class="crest"><span>IB</span></div>
            <div class="brand-text">
            <div class="brand-name">InhoBank</div>
            <div class="brand-sub">Est. 1888 · Private</div>
            </div>
        </div>

        <nav class="nav">
            <div class="nav-label">Banking</div>

            <RouterLink to="/dashboard" class="nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9.5 12 4l9 5.5"/><path d="M5 10v9h14v-9"/><path d="M9 19v-5h6v5"/></svg>
                Overview
            </RouterLink>
            
            <RouterLink to="/transfer" class="nav-item">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 7h11"/><path d="M14 3l4 4-4 4"/><path d="M17 17H6"/><path d="M10 21l-4-4 4-4"/></svg>
                Transfer
            </RouterLink>

            <template v-if="authStore.isEmployee">
                <div class="nav-label">Management</div>

                <RouterLink to="/accounts" class="nav-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
                    Accounts
                </RouterLink>

                <RouterLink to="/users" class="nav-item">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>
                    Users
                </RouterLink>
            </template>
        </nav>

        <div class="sidebar-foot">
            <div class="member">
                <div class="eyebrow">Membership</div>
                <div class="member-line">{{ authStore.isEmployee ? 'Employee Portal' : 'Private Client · Tier I' }}</div>
                <div class="member-since">{{ authStore.isEmployee ? 'InhoBank Staff' : 'Member since ' + memberSince }}</div>
            </div>

            <div class="foot-links">
                <a @click="handleLogout" style="cursor:pointer">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
                    Sign out
                </a>
            </div>
        </div>
    </aside>
</template>

<script>
    /*import { ref, computed } from 'vue';

    defineProps({
        authStore: {
            type: Object
        },
        currentUser: {
            type: Object
        }
    });

    const memberSince = computed(() => {
        if (!currentUser.value?.createdAt) return new Date().getFullYear().toString();
        return new Date(currentUser.value.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    });*/
</script>