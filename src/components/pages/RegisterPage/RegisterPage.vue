<template>
  <div class="auth-page">
    <div class="auth-card auth-card-wide">

      <div class="auth-logo">
        <span class="auth-logo-name">InhoBank</span>
        <span class="auth-logo-sub">Open an account</span>
      </div>

      <div v-if="error"   class="alert alert-error">⚠ {{ error }}</div>
      <div v-if="success" class="alert alert-success">
        ✓ Registration submitted. An employee will review and approve your account.
      </div>

      <form v-if="!success" @submit.prevent="handleRegister">
        <div class="field-row">
          <div class="field">
            <label class="label">First name</label>
            <input v-model="form.firstName" class="input" placeholder="John" required />
          </div>
          <div class="field">
            <label class="label">Last name</label>
            <input v-model="form.lastName" class="input" placeholder="Doe" required />
          </div>
        </div>

        <div class="field">
          <label class="label">Infix <span style="opacity:0.5;text-transform:none;letter-spacing:0">(optional)</span></label>
          <input v-model="form.infix" class="input" placeholder="van, de, etc." />
        </div>

        <div class="field">
          <label class="label">Email address</label>
          <input v-model="form.email" type="email" class="input"
            placeholder="you@example.com" required autocomplete="email" />
        </div>

        <div class="field">
          <label class="label">Password</label>
          <input v-model="form.password" type="password" class="input"
            placeholder="Min. 8 characters" required autocomplete="new-password" />
        </div>

        <div class="field-row">
          <div class="field">
            <label class="label">BSN</label>
            <input v-model="form.bsn" class="input" placeholder="9 digits"
              required maxlength="9" pattern="\d{9}" />
          </div>
          <div class="field">
            <label class="label">Phone</label>
            <input v-model="form.phoneNumber" class="input" placeholder="06xxxxxxxx" required />
          </div>
        </div>

        <button type="submit" class="btn btn-gold" style="width:100%; margin-top:0.5rem" :disabled="loading">
          <span v-if="loading" class="spinner"></span>
          {{ loading ? 'Submitting…' : 'Create account' }}
        </button>
      </form>

      <p class="auth-divider">
        Already have an account? <RouterLink to="/login">Sign in</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../../../stores/authStore.js'

const authStore = useAuthStore()
const error   = ref('')
const success = ref(false)
const loading = ref(false)

const form = ref({
  email: '', password: '', firstName: '',
  infix: '', lastName: '', bsn: '', phoneNumber: '',
})

async function handleRegister() {
  error.value   = ''
  success.value = false
  loading.value = true
  try {
    await authStore.register(form.value)
    success.value = true
    form.value = { email:'', password:'', firstName:'', infix:'', lastName:'', bsn:'', phoneNumber:'' }
  } catch (e) {
    error.value = e.message || 'Registration failed'
  } finally {
    loading.value = false
  }
}
</script>