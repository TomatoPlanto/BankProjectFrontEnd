<template>
    <div class="app">
        <div>
            <div>
                <label>Iban</label>
                <div>{{ accountIban }}</div>
            </div>
            <div>
                <label>Type</label>
                <div>{{ accountType }}</div>
            </div>
            <div>
                <label>Balance</label>
                <div>{{ accountBalance }}</div>
            </div>
            <div>
                <label>Daily Limit</label>
                <div>{{ accountDailyLimit }}</div>
            </div>
            <div>
                <label>Transfer Limit</label>
                <div>{{ accountTransferLimit }}</div>
            </div>
            <div>
                <label>Status</label>
                <div>{{ accountStatus }}</div>
            </div>
            <div>
                <label>Minimum Balance</label>
                <div>{{ accountMinimum }}</div>
            </div>
        </div>
        <div>
            <table>
                <thead>
                    <tr>
                        <th>sender</th>
                        <th>receiver</th>
                        <th>amount</th>
                        <th>date</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="trans in transactionsList" :key="trans.transactionId">
                        <td>{{ trans.fromAccountId }}</td>
                        <td>{{ trans.toAccountId }}</td>
                        <td>{{ trans.amount }}</td>
                        <td>{{ trans.createdAt }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue'
    import { useRoute } from 'vue-router';
    import { useAuthStore } from '../../../stores/authStore.js';
    import { accountService } from '../../../services/accountService.js';
    import { transactionService } from '../../../services/transactionService.js'; // <div>{{ $route.params.accountId }}</div>

    const route = useRoute();
    const authStore = useAuthStore();

    const account = ref(null);
    const transactionsPage = ref(null);

    const error = ref('');

    const accountIban = computed(() => {
        if (account.value === null) return "";
        return account.value.iban;
    })

    const accountType = computed(() => {
        if (account.value === null) return "";
        return account.value.accountType;
    })

    const accountBalance = computed(() => {
        if (account.value === null) return "";
        return account.value.balance;
    })

    const accountDailyLimit = computed(() => {
        if (account.value === null) return "";
        return account.value.dailyLimit;
    })

    const accountTransferLimit = computed(() => {
        if (account.value === null) return "";
        return account.value.transferLimit;
    })

    const accountStatus = computed(() => {
        if (account.value === null) return "";
        return account.value.status;
    })

    const accountMinimum = computed(() => {
        if (account.value === null) return "";
        return account.value.absoluteMinimum;
    })

    const transactionsList = computed(() => {
        if (transactionsPage.value === null) return "";
        return transactionsPage.value.content;
    })


    onMounted(async () => {
        try {
            let accountId = route.params.accountId;

            account.value = await accountService.getAccountById(authStore.token, accountId);

            transactionsPage.value = await transactionService.getAccountTransaction(authStore.token, { accountId: accountId, pageNumber: 0, transactionsPerPage: 10, sorting: "", sortingOrder: true } );
        } 
        catch (e) {
            error.value = e.message;
        }

        //console.log(error.value);

        //console.log(transactionsPage.value.content[0].transactionId);
    })
</script>