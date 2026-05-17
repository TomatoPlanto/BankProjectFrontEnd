<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6">Banking App</h1>
      <h2 class="text-xl text-center mb-6 text-gray-600">Login</h2>

      <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded mb-4">
        {{ error }}
      </div>

      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Email</label>
          <input
              v-model="email"
              type="email"
              class="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter your email"
              required
          />
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Password</label>
          <input
              v-model="password"
              type="password"
              class="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
              placeholder="Enter your password"
              required
          />
        </div>

        <button
            type="submit"
            :disabled="loading"
            class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {{ loading ? 'Logging in...' : 'Login' }}
        </button>
      </form>

      <p class="text-center mt-4 text-gray-600">
        No account?
        <RouterLink to="/register" class="text-blue-600 hover:underline">Register</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../../../stores/authStore.js';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

async function handleLogin() {
  error.value = '';
  loading.value = true;
  try {
    await authStore.login(email.value, password.value);
    router.push('/dashboard');
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>