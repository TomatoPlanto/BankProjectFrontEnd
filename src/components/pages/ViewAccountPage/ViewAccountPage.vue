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
            <div class="hero">
                <div class="hero-main">
                    <div>
                        <div class="eyebrow">Total Balance</div>
                    
                        <div class="balance figure">
                            <span class="cur">€</span>{{ accountBalanceWhole }}<span class="cents">.{{ accountBalanceCents }}</span>
                        </div>
                    </div>
                    <div>
                        <div class="eyebrow">Iban</div>

                        <div class="iban">{{ accountIban }}</div>
                    </div>

                    <div class="acc-status-holder">
                        <div class="eyebrow">Status</div>

                        <span v-if="accountStatus == 'ACTIVE'" class="acc-active">Active</span>
                        <span v-if="accountStatus == 'CLOSED'" class="acc-closed">Closed</span>
                    </div>
                </div>
                <div class="hero-stats">
                    <div class="hstat">
                        <div class="k">Account Type</div>
                        <div class="v small">{{ accountType }}</div>
                    </div>

                    <div class="hstat">
                        <div class="k">Min Balance</div>
                        <div class="v small">{{ accountMinimum }}</div>
                    </div>

                    <div class="hstat">
                        <div class="k">Daily limit</div>
                        <div class="v small">{{ accountDailyLimit }}</div>
                    </div>
                    <div class="hstat">
                        <div class="k">Transfer limit</div>
                        <div class="v small">{{ accountTransferLimit }}</div>
                    </div>
                </div>
            </div>
            <div v-if="!loading" class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th></th>
                            <th>text</th>
                            <th>amount</th>
                            <th>date</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="trans in transactionsList" v-on:click="onTransactionClick(trans)">            
                            <td>
                                <template v-if="getTransType(trans) == 'deposit'">
                                        <span>--&gt;</span>
                                    </template>
                                    <template v-if="getTransType(trans) == 'withdraw'">
                                        <span>&lt;--</span>
                                    </template>
                                    <template v-if="getTransType(trans) == 'transfer_get'">
                                        <span>--&gt;</span>
                                    </template>
                                    <template v-if="getTransType(trans) == 'transfer_send'">
                                        <span>&lt;--</span>
                                </template>
                            </td>  
                            <td class="acc-tbl-text">{{ getTransText(trans) }}</td>
                            <td>
                                <div :class="getTransMoneyPM(trans) === '+' ? 'acc-tbl-amount-plus' : 'acc-tbl-amount-min'">{{ getTransMoney(trans) }}</div>
                            </td>                         
                            <td class="acc-tbl-date">{{ getTransDate(trans) }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>
            <div>
                
            </div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useRouter, useRoute } from 'vue-router';
    import { useAuthStore } from '../../../stores/authStore.js';
    import { accountService } from '../../../services/accountService.js';
    import { userService } from '../../../services/userService.js';
    import { transactionService } from '../../../services/transactionService.js'; 
 
    const route = useRoute();
    const router = useRouter();
    const authStore = useAuthStore();

    const currentUser = ref(null);
    
    const account = ref(null);

    const accountIban = computed(() => {
        if (account.value === null) return "";
        return account.value.iban;
    })

    const accountType = computed(() => {
        if (account.value === null) return "";
        return account.value.accountType == "CHECKING" ? 'Checking' : 'Savings';
    })

    const accountBalanceWhole = computed(() => {
        if (account.value === null) return "";
        return Math.floor(account.value.balance).toLocaleString('en');
    })

    const accountBalanceCents = computed(() => {
        if (account.value === null) return "";
        return (account.value.balance % 1).toFixed(2).slice(2);
    })

    const accountDailyLimit = computed(() => {
        if (account.value === null) return "";
        return formatMoneyAccount(account.value.dailyLimit);
    })

    const accountTransferLimit = computed(() => {
        if (account.value === null) return "";
        return formatMoneyAccount(account.value.transferLimit);
    })

    const accountStatus = computed(() => {
        if (account.value === null) return "";
        return account.value.status;
    })

    const accountMinimum = computed(() => {
        if (account.value === null) return "";
        return formatMoneyAccount(account.value.absoluteMinimum);
    })

    const memberSince = computed(() => {
        if (!currentUser.value?.createdAt) return new Date().getFullYear().toString();
        return new Date(currentUser.value.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    })

    function formatMoneyAccount(amount){
         return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(amount);
    }

    let error = ref('');
    let loading = ref(true);

    let transactionsPage = ref(null);
    let currentPage = ref(0);

    let transactionsList = computed(() => {
        if (transactionsPage.value === null) return [];
        return transactionsPage.value.content;
    })

    onMounted(async () => {
        try {
            let accountId = route.params.accountId;

            currentUser.value = await userService.getMe(authStore.token);
      
            account.value = await accountService.getAccountById(authStore.token, accountId);

            transactionsPage.value = await transactionService.getAccountTransaction(authStore.token, accountId, currentPage.value, 10, 'createdAt', false);

            //console.log(transactionsPage.value);
        } 
        catch (e) {
            error.value = e.message;
        }

        loading.value = false;
    }) 

    function getTransType(trans){
        if(trans === undefined || trans.length == 0) return '';

        if(trans.fromAccount == null) return 'deposit';

        if(trans.toAccount == null) return 'withdraw';

        if(trans.toAccount.accountId == account.value.accountId) return 'transfer_get';

        if(trans.fromAccount.accountId == account.value.accountId) return 'transfer_send';
    }

    function getTransText(trans){
        if(trans === undefined || trans.length == 0) return '';

        if(trans.fromAccount == null) return 'Deposit';

        if(trans.toAccount == null) return 'Withdraw';

        if(trans.toAccount.accountId == account.value.accountId) return formatAccountName(trans.fromAccount);

        if(trans.fromAccount.accountId == account.value.accountId) return formatAccountName(trans.toAccount);
    }

    function formatAccountName(account){
        let iban = account.iban;

        let short_iban = iban.substr(0, 4) + '...' + iban.substr(15, 4);

        return account.ownerName + ' (' + short_iban + ')';
    }

    function getTransMoney(trans){
        if(trans === undefined || trans.length == 0) return '';

        if(trans.fromAccount == null) return formatMoney(trans.amount, '+');

        if(trans.toAccount == null) return formatMoney(trans.amount, '-');

        if(trans.toAccount.accountId == account.value.accountId) return formatMoney(trans.amount, '+');

        if(trans.fromAccount.accountId == account.value.accountId) return formatMoney(trans.amount, '-');
    }

    function getTransMoneyPM(trans){
        if(trans === undefined || trans.length == 0) return '';

        if(trans.fromAccount == null) return '+';

        if(trans.toAccount == null) return '-';

        if(trans.toAccount.accountId == account.value.accountId) return '+';

        if(trans.fromAccount.accountId == account.value.accountId) return '-';
    }

    function formatMoney(amount, sign){
         return sign + (new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(amount));
    }

    function getTransDate(trans){
        return formatTransactionDate(new Date(trans.createdAt));
    }

    function formatTransactionDate(date){
        return date.toLocaleString('default', { month: 'long', day: 'numeric' });
    }

    function onTransactionClick(trans){
        this.router.push({ name: 'transaction', params: { transactionId: trans.transactionId } });
    }

    // (new Date(trans.createdAt)).toLocaleString("de-DE")
</script>