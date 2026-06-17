<template>
  <div class="page">
    <nav class="navbar">
      <span class="navbar-brand">InhoBank</span>
      <div class="navbar-links">
        <template v-if="authStore.isEmployee">
          <RouterLink to="/dashboard"  class="nav-link"><b><i>Dashboard</i></b></RouterLink>
          <RouterLink to="/accounts" class="nav-link">Accounts</RouterLink>
          <RouterLink to="/users"  class="nav-link">Users</RouterLink>
        </template>
        <span style="font-size:0.8rem; color:var(--muted)">{{ authStore.email }}</span>
        <button class="btn btn-ghost" style="padding:0.4rem 1rem" @click="openDetails()">User details</button>
        <button class="btn btn-danger" style="padding:0.4rem 1rem" @click="handleLogout">Sign out</button>
      </div>
    </nav>

    <div class="page-content">
      <h1 class="page-title">Good day, {{ firstName }}</h1>

      <div v-if="loading" style="color:var(--muted); padding:3rem 0">Loading…</div>
      <div v-if="error" class="alert alert-error">⚠ {{ error }}</div>

      <div v-if="!loading" style="display:grid; grid-template-columns:repeat(auto-fill,minmax(280px,1fr)); gap:1.25rem; margin-bottom:2rem">
        <div v-for="account in accounts" :key="account.accountId" class="stat-card">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1rem">
            <div>
              <div class="stat-label">{{ account.accountType }}</div>
              <div style="font-size:0.75rem; color:var(--muted); font-family:monospace; margin-top:0.2rem">
                {{ account.iban }}
              </div>
            </div>
            <span :class="account.status === 'ACTIVE' ? 'badge badge-green' : 'badge badge-red'">
              {{ account.status }}
            </span>
          </div>

          <div class="stat-value">€{{ Number(account.balance).toFixed(2) }}</div>

          <div style="display:grid; grid-template-columns:1fr 1fr; gap:0.5rem; margin-top:1rem">
            <div>
              <div class="stat-label">Daily limit</div>
              <div style="font-size:0.875rem">€{{ account.dailyLimit }}</div>
            </div>
            <div>
              <div class="stat-label">Transfer limit</div>
              <div style="font-size:0.875rem">€{{ account.transferLimit }}</div>
            </div>
          </div>
        </div>
      </div>

      <div v-if="authStore.isEmployee && !loading" class="card" style="padding:1.5rem">
        <div style="font-size:0.8rem; color:var(--muted); text-transform:uppercase; letter-spacing:0.07em; margin-bottom:1rem">
          Employee panel
        </div>
        <div style="display:flex; gap:0.75rem">
          <RouterLink to="/accounts" class="btn btn-ghost">Manage Accounts</RouterLink>
          <RouterLink to="/users"    class="btn btn-ghost">Manage Users</RouterLink>
        </div>
      </div>
    </div>

    <div v-if="selectedUser" class="modal-overlay" @click.self="selectedUser = null">
      <div class="modal">
        <input v-model="selectedUser.firstName" disabled />
        <input v-model="selectedUser.lastName" disabled />
        <input v-model="selectedUser.infix" disabled />
        <input v-model="selectedUser.email" disabled />
        <input v-model="selectedUser.bsn" disabled />
        <input v-model="selectedUser.phoneNumber" disabled />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/authStore.js'
import { accountService } from '../../../services/accountService.js'
import { userService } from '../../../services/userService.js'

const router    = useRouter()
const authStore = useAuthStore()

const accounts = ref([])
const loading  = ref(true)
const error    = ref('')

const firstName = computed(() => {
  if (!authStore.email) return ''
  return authStore.email.split('@')[0]
})
  
onMounted(async () => {
  try {
    if (authStore.isCustomer) {
      const me = await userService.getMe(authStore.token)
      accounts.value = await accountService.getAccountsByUserId(authStore.token, me.userId)
    } else if (authStore.isEmployee) {
      accounts.value = (await accountService.getAllAccounts(authStore.token)).content
    }
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

const selectedUser = ref(null)

function openDetails() {
  selectedUser.value = {
    firstName: authStore.firstName.value,
    lastName: authStore.lastName.value,
    infix: authStore.infix.value,
    email: authStore.email.value,
    bsn: authStore.bsn.value,
    phoneNumber: authStore.phoneNumber.value,
  }
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>