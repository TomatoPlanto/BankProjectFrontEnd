<template>
  <div class="auth-page">
    <div class="auth-card">
      <div class="auth-logo">
        <span class="auth-logo-name">InhoBank</span>
        <span class="auth-logo-sub">ATM Access</span>
      </div>

      <div style="height:2px; background:linear-gradient(90deg,var(--gold-bright),transparent); margin-bottom:1.75rem; border-radius:2px;"></div>

      <div v-if="error" class="alert alert-error">⚠ {{ error }}</div>

      <div class="field">
        <label class="label">IBAN</label>
        <input v-model="iban" class="input"
          placeholder="NLxxINHO0xxxxxxxxxx"
          style="font-family:monospace; letter-spacing:0.04em"
          autocomplete="off" />
      </div>

      <div class="field">
        <label class="label">4-digit PIN</label>
        <input v-model="pin" type="password" class="input pin-input"
          placeholder="••••" maxlength="4" inputmode="numeric" />
      </div>

      <button class="btn btn-gold" :disabled="loading" @click="handleAtmLogin">
        <span v-if="loading" class="spinner"></span>
        {{ loading ? 'Verifying…' : 'Access ATM' }}
      </button>

      <p class="auth-divider" style="margin-top:1.25rem">
        ← <RouterLink to="/login">Back to regular login</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAtmStore } from '../../../stores/atmStore.js'
import { post } from '../../../utils/api.js'

const router    = useRouter()
const iban    = ref('')
const pin     = ref('')
const error   = ref('')
const loading = ref(false)
const atmStore = useAtmStore()

async function handleAtmLogin() {
  error.value = ''
  loading.value = true
  try {
    const response = await post('/api/atm/login', {
      iban: iban.value,
      pin: pin.value,
    })
    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'ATM login failed')
    }
    const data = await response.json()
    atmStore.login(data)
    router.push('/atm')
  } catch (e) {
    error.value = e.message || 'Invalid IBAN or PIN'
  } finally {
    loading.value = false
  }
}
</script>