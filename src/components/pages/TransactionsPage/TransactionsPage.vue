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
                <RouterLink to="/transactions" class="nav-item active">
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
            <header class="topbar">
                <div class="greeting">
                    <div class="hello">Transactions</div>
                    <div class="date">Manage customer transactions</div>
                </div>
                <div class="topbar-actions">
                    <div class="avatar">EM</div>
                </div>
            </header>

            <div v-if="error" class="alert alert-error">
                Unexpected error has occured! Failed to load transaction. {{ error }}
            </div>   
            
            <div class="panel" v-if="!loading">
                <div class="eyebrow">Filters</div>
                
                <div class="field">
                    <label for="fromIban" class="label">Sender Iban</label>
                    <input id="fromIban" name="fromIban" type="text" v-model="filter.fromIban" class="input">
                </div>

                <div class="field">
                    <label for="toIban" class="label">Receiver Iban</label>
                    <input id="toIban" name="toIban" type="text" v-model="filter.toIban" class="input">
                </div>

                <div class="field">
                    <label for="minAmount" class="label">Minimum Amount</label>
                    <input id="minAmount" name="minAmount" type="number" step="0.01" min="0.01" max="1000000" v-model="filter.minAmount" class="input">
                </div class="field">

                <div class="field">
                    <label for="maxAmount" class="label">Maximum Amount</label>
                    <input id="maxAmount" name="maxAmount" type="number" step="0.01" min="0.01" max="1000000" v-model="filter.maxAmount" class="input">
                </div>

                <div class="field"> 
                    <label for="equalAmount" class="label">Exact Amount</label>
                    <input id="equalAmount" name="equalAmount" type="number" step="0.01" min="0.01" max="1000000" v-model="filter.equalAmount" class="input">
                </div>

                <div class="field"> 
                    <label for="sorting" class="label">Sorting</label>
                    <select id="sorting" name="sorting" v-model="sorting" class="input">
                        <option value="createdAt" selected>Date</option>
                        <option value="amount">Amount</option>
                        <option value="description">Description</option>
                        <option value="type">Type</option>
                    </select>

                    <label for="order" class="label">Order</label>
                    <select id="order" name="order" v-model="order" class="input">
                        <option value="false" selected>Asending</option>
                        <option value="true">Desending</option>
                    </select>
                </div>

                <div style="display: flex; justify-content: space-between;">
                    <button v-on:click="onFilterClick()" class="btn btn-gold">Filter</button>
                    <button v-on:click="clearFilter()" class="btn btn-gold">Clear Filter</button>
                </div>             
            </div>

            <div v-if="!loading && transactionsPage.totalElements == 0" class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>No tranactions found.</th>
                        </tr>
                    </thead>
                </table>
            </div>

            <div v-if="!loading && transactionsPage.totalElements > 0" class="table-wrap">
                <table>
                    <thead>
                        <tr>
                            <th>type</th>
                            <th>sender</th>
                            <th>receiver</th>
                            <th>amount</th>
                            <th>date</th>
                            <th>initiator</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="trans in transactionsList" v-on:click="onTransactionClick(trans)">            
                            <td>{{ getTransactionTypeFormated(trans) }}</td>  
                            <td>{{ getTransactionAccountName(trans.fromAccount) }}</td>  
                            <td>{{ getTransactionAccountName(trans.toAccount) }}</td>  
                            <td>{{ formatMoney(trans.amount) }}</td>  
                            <td>{{ formatDate(trans.createdAt) }}</td>  
                            <td>{{ formatType(trans.type) }}</td>  
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="acc-page-holder" v-if="!loading && transactionsPage.totalPages != 1 && transactionsPage.totalElements > 0">
                <div class="acc-page-holder-holder">
                    <div v-if="transactionsPage.totalPages > 2" :class="currentPage == 0 ? 'acc-page-button page-button-not-active' : 'acc-page-button page-button-nav'" v-on:click="goToPage(0, false)"><span>&lt;&lt;</span></div>
                    <div :class="currentPage == 0 ? 'acc-page-button page-button-not-active' : 'acc-page-button page-button-nav'" v-on:click="goToPage(currentPage - 1, false)"><span>&lt;</span></div>

                    <div v-for="i in (offEndPage - offStartPage + 1)" :class="(i + offStartPage - 1) == currentPage ? 'page-button-cur acc-page-button' : 'acc-page-button'" v-on:click="goToPage(i + offStartPage - 1, false)">
                        <span>{{ i + offStartPage}}</span>
                    </div>

                    <div :class="currentPage == transactionsPage.totalPages - 1 ? 'acc-page-button page-button-not-active' : 'acc-page-button page-button-nav'" v-on:click="goToPage(currentPage + 1, false)"><span>&gt;</span></div>
                    <div v-if="transactionsPage.totalPages > 2" :class="currentPage == transactionsPage.totalPages - 1 ? 'acc-page-button page-button-not-active' : 'acc-page-button page-button-nav'" v-on:click="goToPage(transactionsPage.totalPages - 1, false)"><span>&gt;&gt;</span></div>
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

    const displayPagesLNR = 5;
    const trasnsPerPage = 24;

    let transactionsPage = ref(null);
    let currentPage = ref(0);
    let offStartPage = ref(null);
    let offEndPage = ref(null);

    let filter = {fromIban: null, toIban: null, minAmount: null, maxAmount: null, equalAmount: null };

    let sorting = 'createdAt';
    let order = false;

    let transactionsList = computed(() => {
        if (transactionsPage.value === null) return [];
        return transactionsPage.value.content;
    })

    const memberSince = computed(() => {
        if (!currentUser.value?.createdAt) return new Date().getFullYear().toString();
        return new Date(currentUser.value.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
    })

    onMounted(async () => {
        try {
            currentUser.value = await userService.getMe(authStore.token);

            transactionsPage.value = await transactionService.getTransactions(authStore.token, null, currentPage.value, trasnsPerPage, sorting, order, filter);

            calcPaginationStaff();

            loading.value = false;
        } 
        catch (e) {
            error.value = e.message;
        }  
    }) 

    function getTransactionTypeFormated(trans){
        if(trans === undefined || trans.length == 0) return '';

        if(trans.fromAccount == null) return 'Deposit';

        if(trans.toAccount == null) return 'Withdraw';

        return 'Transfer';
    }

    function getTransactionAccountName(account){
        if(account == undefined || account == null) return '-';

        return account.iban;
    }

    function formatMoney(amount){
         return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", minimumFractionDigits: 2 }).format(amount);
    }

    function formatDate(date){
        return (new Date(date)).toLocaleString("de-DE");
    }

    function formatType(type){
        return type == 'CUSTOMER_TRANSFER' ? 'Customer' : 'Employee';
    }

    function onTransactionClick(trans){
        router.push({ name: 'transaction', params: { transactionId: trans.transactionId } });
    }

    function calcPaginationStaff(){
        offStartPage.value = currentPage.value - displayPagesLNR;
        offEndPage.value = currentPage.value + displayPagesLNR;

        if(offStartPage.value < transactionsPage.value.totalPages - offEndPage.value){
            if(offStartPage.value < 0){
                offEndPage.value -= offStartPage.value;
                offStartPage.value = 0;
            }

            if(offEndPage.value > transactionsPage.value.totalPages - 1) offEndPage.value = transactionsPage.value.totalPages - 1;
        }
        else{
            if(offEndPage.value > transactionsPage.value.totalPages - 1){
                offStartPage.value -= offEndPage.value - transactionsPage.value.totalPages + 1;
                offEndPage.value = transactionsPage.value.totalPages - 1;
            }

            if(offStartPage.value < 0) offStartPage.value = 0;
        }  
    }

    async function goToPage(page, force) {
        if(page < 0 || page > transactionsPage.value.totalPages - 1) return;

        if(!force && currentPage.value == page) return;

        loading.value = true;

        currentPage.value = page;

        try {
            transactionsPage.value = await transactionService.getTransactions(authStore.token, null, currentPage.value, trasnsPerPage, sorting, order, filter);

            console.log(transactionsPage.value);

            calcPaginationStaff();   

            loading.value = false;
        }
        catch(e){
            error = e;
        }    
    }

    function onFilterClick(){
        goToPage(0, true);
    }

    function clearFilter(){
        filter = {fromIban: null, toIban: null, minAmount: null, maxAmount: null, equalAmount: null };

        goToPage(0, true);
    }

    function handleLogout() {
        authStore.logout()
        router.push('/login')
    }
</script>