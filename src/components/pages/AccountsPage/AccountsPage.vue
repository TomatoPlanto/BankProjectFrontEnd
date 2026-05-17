<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold text-blue-600">Banking App</h1>
      <div class="flex items-center gap-4">
        <RouterLink to="/dashboard" class="text-blue-600 hover:underline">Dashboard</RouterLink>
        <RouterLink to="/users" class="text-blue-600 hover:underline">Users</RouterLink>
        <button @click="handleLogout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </nav>

    <div class="max-w-6xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6">Manage Accounts</h2>

      <div v-if="accountStore.loading" class="text-center py-10 text-gray-500">Loading...</div>
      <div v-if="accountStore.error" class="bg-red-100 text-red-700 p-3 rounded mb-4">{{ accountStore.error }}</div>
      <div v-if="accountStore.success" class="bg-green-100 text-green-700 p-3 rounded mb-4">{{ accountStore.success }}</div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
          <tr>
            <th class="text-left p-4 text-gray-600">IBAN</th>
            <th class="text-left p-4 text-gray-600">Type</th>
            <th class="text-left p-4 text-gray-600">Balance</th>
            <th class="text-left p-4 text-gray-600">Daily Limit</th>
            <th class="text-left p-4 text-gray-600">Transfer Limit</th>
            <th class="text-left p-4 text-gray-600">Status</th>
            <th class="text-left p-4 text-gray-600">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="account in accountStore.accounts" :key="account.accountId" class="border-t">
            <td class="p-4 text-sm font-mono">{{ account.iban }}</td>
            <td class="p-4">
                <span class="text-sm px-2 py-1 rounded"
                      :class="account.accountType === 'CHECKING' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'">
                  {{ account.accountType }}
                </span>
            </td>
            <td class="p-4 font-bold">€{{ account.balance.toFixed(2) }}</td>
            <td class="p-4">€{{ account.dailyLimit }}</td>
            <td class="p-4">€{{ account.transferLimit }}</td>
            <td class="p-4">
                <span class="text-sm px-2 py-1 rounded"
                      :class="account.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'">
                  {{ account.status }}
                </span>
            </td>
            <td class="p-4 flex gap-2">
              <button @click="openLimits(account)"
                      class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 text-sm">
                Limits
              </button>
              <button v-if="account.status === 'ACTIVE'" @click="closeAccount(account.accountId)"
                      class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                Close
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedAccount" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 class="text-lg font-bold mb-4">Update Limits</h3>
        <p class="text-sm text-gray-500 mb-4">{{ selectedAccount.iban }}</p>

        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Daily Limit</label>
          <input v-model="limitsForm.dailyLimit" type="number"
                 class="w-full border rounded p-2 focus:outline-none focus:border-blue-500" />
        </div>
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Transfer Limit</label>
          <input v-model="limitsForm.transferLimit" type="number"
                 class="w-full border rounded p-2 focus:outline-none focus:border-blue-500" />
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Absolute Minimum</label>
          <input v-model="limitsForm.absoluteMinimum" type="number"
                 class="w-full border rounded p-2 focus:outline-none focus:border-blue-500" />
        </div>

        <div class="flex gap-4">
          <button @click="saveLimits"
                  class="flex-1 bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
            Save
          </button>
          <button @click="selectedAccount = null"
                  class="flex-1 bg-gray-300 text-gray-700 py-2 rounded hover:bg-gray-400">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore.js';
import { useAccountStore } from '../../../stores/accountStore.js';

const router = useRouter();
const authStore = useAuthStore();
const accountStore = useAccountStore();
const selectedAccount = ref(null);
const limitsForm = ref({
  dailyLimit: 0,
  transferLimit: 0,
  absoluteMinimum: 0,
});

onMounted(async () => {
  await accountStore.fetchAllAccounts();
});

function openLimits(account) {
  selectedAccount.value = account;
  limitsForm.value = {
    dailyLimit: account.dailyLimit,
    transferLimit: account.transferLimit,
    absoluteMinimum: account.absoluteMinimum,
  };
}

async function saveLimits() {
  await accountStore.updateLimits(selectedAccount.value.accountId, limitsForm.value);
  selectedAccount.value = null;
}

async function closeAccount(accountId) {
  await accountStore.closeAccount(accountId);
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>