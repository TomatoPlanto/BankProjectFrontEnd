<template>
    <div class="app">
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

                    <RouterLink to="/transactions" class="nav-item">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
                        Transactions
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

        <div class="main">
            <div v-if="error" class="alert alert-error">
                Unexpected error has occured! Failed to load transaction. 
            </div>

            <div class="hero" v-if="!loading && !error">
                <div class="hero-main">
                    <div>
                        <div class="eyebrow">Amount</div>

                        <div class="iban">{{ formatMoney(transaction.amount) }}</div>
                    </div>

                    <div v-if="getTransactionType() == 'transfer'">
                        <div class="eyebrow">Sender</div>
                        <div class="iban">{{ getAccountNameFormated(transaction.fromAccount) }}</div>    

                        <div class="eyebrow">Receiver</div>
                        <div class="iban">{{ getAccountNameFormated(transaction.toAccount) }}</div>    
                    </div>

                    <div v-if="getTransactionType() == 'withdraw'">
                        <div class="eyebrow">Sender</div>
                        <div class="iban">{{ getAccountNameFormated(transaction.fromAccount) }}</div>    
                    </div>

                    <div v-if="getTransactionType() == 'deposit'">
                        <div class="eyebrow">Receiver</div>
                        <div class="iban">{{ getAccountNameFormated(transaction.toAccount) }}</div>    
                    </div>

                    <div>
                        <div class="eyebrow">Date</div>
                        <div class="iban">{{ getDateFormated() }}</div>    
                    </div>

                    <div>
                        <div class="eyebrow">Description</div>
                        <div class="iban">{{ transaction.description }}</div>    
                    </div>
                </div>
                <div class="hero-stats">
                    <div class="hstat">
                        <div class="k">Type</div>
                        <div class="v small">{{ getTransactionTypeFormated() }}</div>
                    </div>

                    <div class="hstat">
                        <div class="k">Initiator</div>
                        <div class="v small">{{ getInitiatorFormated() }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { useAuthStore } from '../../../stores/authStore.js';
    import { userService } from '../../../services/userService.js';
    import { transactionService } from '../../../services/transactionService.js'; 
 
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const currentUser = ref(null);

    let error = ref(false);
    let loading = ref(true);

    let transaction = ref(null);

    const memberSince = computed(() => {
        if (!currentUser.value?.createdAt) return new Date().getFullYear().toString();
        return new Date(currentUser.value.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    })

    onMounted(async () => {
        try {
            let transactionId = route.params.transactionId;

            currentUser.value = await userService.getMe(authStore.token);
      
            transaction.value = await transactionService.getTransactionById(authStore.token, transactionId);

            loading.value = false;
        } 
        catch (e) {
            error.value = e.message;
        }

        console.log(error.value);   
    }) 

    function formatMoney(amount){
         return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(amount);
    }

    function getTransactionType(){
        if(transaction.value === undefined || transaction.value.length == 0) return '';

        if(transaction.value.fromAccount == null) return 'deposit';

        if(transaction.value.toAccount == null) return 'withdraw';

        return 'transfer';
    }

    function getAccountNameFormated(account) {
        return account.iban + ' - ' + account.ownerName;
    }

    function getTransactionTypeFormated(){
        if(transaction.value === undefined || transaction.value.length == 0) return '';

        if(transaction.value.fromAccount == null) return 'Deposit';

        if(transaction.value.toAccount == null) return 'Withdraw';

        return 'Transfer';
    }

    function getInitiatorFormated(){
        return transaction.type == 'CUSTOMER_TRANSFER' ? 'Customer' : 'Employee';
    }

    function getDateFormated(){
        return (new Date(transaction.value.createdAt)).toLocaleString("de-DE")
    }

    function handleLogout() {
        authStore.logout()
        router.push('/login')
    }
</script>