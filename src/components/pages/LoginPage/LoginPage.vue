<template>
  <div class="auth-page">
    <div class="auth-card">

      <div class="auth-logo">
        <span class="auth-logo-name">InhoBank</span>
        <span class="auth-logo-sub">Private Banking</span>
      </div>

      <div v-if="error" class="alert alert-error">⚠ {{ error }}</div>

      <form @submit.prevent="handleLogin">
        <div class="field">
          <label class="label">Email address</label>
          <input v-model="email" type="email" class="input"
            placeholder="you@example.com" required autocomplete="email" />
        </div>

        <div class="field">
          <label class="label">Password</label>
          <input v-model="password" type="password" class="input"
            placeholder="••••••••" required autocomplete="current-password" />
        </div>

        <button type="submit" class="btn btn-gold" style="width:100%; margin-top:0.5rem" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Signing in…' : 'Sign in' }}
        </button>
      </form>

      <p class="auth-divider">
        No account? <RouterLink to="/register">Register</RouterLink>
      </p>
      <p class="auth-divider" style="margin-top:0.5rem">
        ATM access? <RouterLink to="/atm-login">ATM Login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/authStore.js'

const router    = useRouter()
const authStore = useAuthStore()

const email    = ref('')
const password = ref('')
const error    = ref('')
const loading  = ref(false)

async function handleLogin() {
  error.value   = ''
  loading.value = true
  try {
    await authStore.login(email.value, password.value)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>