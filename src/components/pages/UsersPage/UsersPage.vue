<template>
  <div class="min-h-screen bg-gray-100">
    <nav class="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h1 class="text-xl font-bold text-blue-600">Banking App</h1>
      <div class="flex items-center gap-4">
        <RouterLink to="/dashboard" class="text-blue-600 hover:underline">Dashboard</RouterLink>
        <RouterLink to="/accounts" class="text-blue-600 hover:underline">Accounts</RouterLink>
        <button @click="handleLogout" class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>
    </nav>

    <div class="max-w-6xl mx-auto p-6">
      <h2 class="text-2xl font-bold mb-6">Manage Users</h2>

      <div class="flex gap-4 mb-6">
        <button @click="filter = 'ALL'"
                :class="filter === 'ALL' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700'"
                class="px-4 py-2 rounded shadow">
          All
        </button>
        <button @click="filter = 'PENDING'"
                :class="filter === 'PENDING' ? 'bg-yellow-500 text-white' : 'bg-white text-gray-700'"
                class="px-4 py-2 rounded shadow">
          Pending
        </button>
        <button @click="filter = 'ACTIVE'"
                :class="filter === 'ACTIVE' ? 'bg-green-600 text-white' : 'bg-white text-gray-700'"
                class="px-4 py-2 rounded shadow">
          Active
        </button>
      </div>

      <div v-if="userStore.loading" class="text-center py-10 text-gray-500">Loading...</div>
      <div v-if="userStore.error" class="bg-red-100 text-red-700 p-3 rounded mb-4">{{ userStore.error }}</div>

      <div class="bg-white rounded-lg shadow overflow-hidden">
        <table class="w-full">
          <thead class="bg-gray-50">
          <tr>
            <th class="text-left p-4 text-gray-600">Name</th>
            <th class="text-left p-4 text-gray-600">Email</th>
            <th class="text-left p-4 text-gray-600">Role</th>
            <th class="text-left p-4 text-gray-600">Status</th>
            <th class="text-left p-4 text-gray-600">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="user in filteredUsers" :key="user.userId" class="border-t">
            <td class="p-4">{{ user.firstName }} {{ user.infix }} {{ user.lastName }}</td>
            <td class="p-4">{{ user.email }}</td>
            <td class="p-4">
                <span class="text-sm px-2 py-1 rounded"
                      :class="user.role === 'EMPLOYEE' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'">
                  {{ user.role }}
                </span>
            </td>
            <td class="p-4">
                <span class="text-sm px-2 py-1 rounded"
                      :class="user.status === 'ACTIVE' ? 'bg-green-100 text-green-700' :
                          user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'">
                  {{ user.status }}
                </span>
            </td>
            <td class="p-4">
              <button v-if="user.status === 'PENDING'"
                      @click="approve(user.userId)"
                      class="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600 mr-2 text-sm">
                Approve
              </button>
              <button v-if="user.status === 'ACTIVE'"
                      @click="close(user.userId)"
                      class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-sm">
                Close
              </button>
            </td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore.js';
import { useUserStore } from '../../../stores/userStore.js';

const router = useRouter();
const authStore = useAuthStore();
const userStore = useUserStore();
const filter = ref('ALL');

const filteredUsers = computed(() => {
  if (filter.value === 'ALL') return userStore.users;
  return userStore.users.filter(u => u.status === filter.value);
});

onMounted(async () => {
  await userStore.fetchAllUsers();
});

async function approve(userId) {
  await userStore.approveUser(userId);
}

async function close(userId) {
  await userStore.closeUser(userId);
}

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>