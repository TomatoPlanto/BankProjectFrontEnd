<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold text-blue-600">Banking App</h1>
      <div class="flex items-center gap-4">
        <span class="text-gray-600">{{ authStore.role }}</span>
        <button @click="handleLogout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </nav>

    <div class="max-w-4xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6">Dashboard</h2>

      <div v-if="loading" class="text-center py-10 text-gray-500">Loading...</div>

      <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded mb-4">{{ error }}</div>

      <div v-if="!loading">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div v-for="account in accounts" :key="account.accountId"
               class="bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-start mb-4">
              <div>
                <p class="text-sm text-gray-500">{{ account.accountType }}</p>
                <p class="text-xs text-gray-400 mt-1">{{ account.iban }}</p>
              </div>
              <span :class="account.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'"
                    class="text-xs px-2 py-1 rounded">
                {{ account.status }}
              </span>
            </div>
            <p class="text-3xl font-bold text-gray-800">€{{ account.balance.toFixed(2) }}</p>
            <div class="mt-4 text-sm text-gray-500 space-y-1">
              <p>Daily limit: €{{ account.dailyLimit }}</p>
              <p>Transfer limit: €{{ account.transferLimit }}</p>
            </div>
          </div>
        </div>

        <div v-if="authStore.isEmployee" class="bg-white rounded-lg shadow p-6">
          <h3 class="text-lg font-bold mb-4">Employee Panel</h3>
          <div class="flex gap-4">
            <RouterLink to="/accounts"
                        class="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Manage Accounts
            </RouterLink>
            <RouterLink to="/users"
                        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
              Manage Users
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore.js';
import { accountService } from '../../../services/accountService.js';
import { userService } from '../../../services/userService.js';

const router = useRouter();
const authStore = useAuthStore();
const accounts = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    if (authStore.isCustomer) {
      const users = await userService.getAllUsers(authStore.token);
      const currentUser = users.find(u => u.email === authStore.email);
      if (currentUser) {
        accounts.value = await accountService.getAccountsByUserId(authStore.token, currentUser.userId);
      }
    } else if (authStore.isEmployee) {
      accounts.value = await accountService.getAllAccounts(authStore.token);
    }
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
});

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>