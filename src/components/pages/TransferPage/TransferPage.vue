<template>
    <div>{{error}}</div>
    <div class="app">
        <form>
            <div class="field-row">
                <div class="field">
                    <label class="label">From iban</label>
                    <input v-model="form.fromIban" class="input" required />
                </div>
                <div class="field">
                    <label class="label">To iban</label>
                    <input v-model="form.toIban" class="input" required />
                </div>
            </div>

            <div class="field-row">
                <div class="field">
                    <label class="label">Amount</label>
                    <input type="number" min="0.01" step="0.01" max="10000" v-model="form.amount" class="input" required />
                </div>
                <div class="field">
                    <label class="label">Description</label>
                    <input v-model="form.description" class="input" required />
                </div>
            </div>

            <button type="submit" class="btn btn-gold" style="width:100%; margin-top:0.5rem" :disabled="loading">
                <span v-if="loading" class="spinner"></span>
                {{ loading ? 'Making Transaction…' : 'Make a transfer' }}
            </button>
        </form>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import { useAuthStore } from '../../../stores/authStore.js';
    import { accountService } from '../../../services/accountService.js';
    import { transactionService } from '../../../services/transactionService.js'; // <div>{{ $route.params.accountId }}</div>

    const route = useRoute();
    const authStore = useAuthStore();

    const form = {fromIban: '', toIban: '', amount: 0, description: ""};

    const error = ref('');
    const loading = ref(false);
    const success = ref(false);

    async function handleRegister() {
        error.value   = '';
        success.value = false;
        loading.value = true;

        try {
            //let fromAcc = await accountService.

            success.value = true;
            form.value = { email:'', password:'', firstName:'', infix:'', lastName:'', bsn:'', phoneNumber:'' };
        } catch (e) {
            error.value = e.message || 'Transaction failed';
        } finally {
            loading.value = false;
        }
    }
</script>