<template>
  <div class="min-h-screen bg-gray-100 flex items-center justify-center">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center mb-6">Banking App</h1>
      <h2 class="text-xl text-center mb-6 text-gray-600">Register</h2>

      <div v-if="error" class="bg-red-100 text-red-700 p-3 rounded mb-4">
        {{ error }}
      </div>

      <div v-if="success" class="bg-green-100 text-green-700 p-3 rounded mb-4">
        Registration successful! Wait for employee approval before logging in.
      </div>

      <form @submit.prevent="handleRegister">
        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Email</label>
          <input v-model="form.email" type="email"
                 class="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                 placeholder="Enter your email" required />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Password</label>
          <input v-model="form.password" type="password"
                 class="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                 placeholder="Enter your password" required />
        </div>

        <div class="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label class="block text-gray-700 mb-2">First Name</label>
            <input v-model="form.firstName"
                   class="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                   placeholder="First name" required />
          </div>
          <div>
            <label class="block text-gray-700 mb-2">Last Name</label>
            <input v-model="form.lastName"
                   class="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                   placeholder="Last name" required />
          </div>
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-2">Infix (optional)</label>
          <input v-model="form.infix"
                 class="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                 placeholder="van, de, etc." />
        </div>

        <div class="mb-4">
          <label class="block text-gray-700 mb-2">BSN</label>
          <input v-model="form.bsn"
                 class="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                 placeholder="9 digit BSN number" required maxlength="9" />
        </div>

        <div class="mb-6">
          <label class="block text-gray-700 mb-2">Phone Number</label>
          <input v-model="form.phoneNumber"
                 class="w-full border rounded p-2 focus:outline-none focus:border-blue-500"
                 placeholder="Phone number" required />
        </div>

        <button type="submit" :disabled="loading"
                class="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:opacity-50">
          {{ loading ? 'Registering...' : 'Register' }}
        </button>
      </form>

      <p class="text-center mt-4 text-gray-600">
        Already have an account?
        <RouterLink to="/login" class="text-blue-600 hover:underline">Login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '../../../stores/authStore.js';

const authStore = useAuthStore();
const error = ref('');
const success = ref(false);
const loading = ref(false);

const form = ref({
  email: '',
  password: '',
  firstName: '',
  infix: '',
  lastName: '',
  bsn: '',
  phoneNumber: '',
});

async function handleRegister() {
  error.value = '';
  success.value = false;
  loading.value = true;
  try {
    await authStore.register(form.value);
    success.value = true;
    form.value = {
      email: '', password: '', firstName: '',
      infix: '', lastName: '', bsn: '', phoneNumber: ''
    };
  } catch (e) {
    error.value = e.message;
  } finally {
    loading.value = false;
  }
}
</script>