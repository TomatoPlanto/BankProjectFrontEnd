<template>
  <div class="page">
    <nav class="navbar">
      <span class="navbar-brand">InhoBank</span>
      <div class="navbar-links">
        <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
        <RouterLink to="/users"     class="nav-link">Users</RouterLink>
        <button class="btn btn-danger" style="padding:0.4rem 1rem" @click="handleLogout">Sign out</button>
      </div>
    </nav>

    <div class="page-content">
      <h1 class="page-title">Accounts</h1>

      <div v-if="accountStore.loading" style="color:var(--muted); padding:3rem 0">Loading…</div>
      <div v-if="accountStore.error"   class="alert alert-error">⚠ {{ accountStore.error }}</div>
      <div v-if="accountStore.success" class="alert alert-success">✓ {{ accountStore.success }}</div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>IBAN</th>
              <th>Type</th>
              <th>Balance</th>
              <th>Daily limit</th>
              <th>Transfer limit</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="account in accountStore.accounts" :key="account.accountId">
              <td style="font-family:monospace; font-size:0.8rem">{{ account.iban }}</td>
              <td>
                <span :class="account.accountType === 'CHECKING' ? 'badge badge-blue' : 'badge badge-purple'">
                  {{ account.accountType }}
                </span>
              </td>
              <td style="font-weight:600; color:var(--accent)">€{{ Number(account.balance).toFixed(2) }}</td>
              <td>€{{ account.dailyLimit }}</td>
              <td>€{{ account.transferLimit }}</td>
              <td>
                <span :class="account.status === 'ACTIVE' ? 'badge badge-green' : 'badge badge-red'">
                  {{ account.status }}
                </span>
              </td>
              <td>
                <div style="display:flex; gap:0.5rem">
                  <button class="btn btn-ghost" style="padding:0.3rem 0.75rem; font-size:0.8rem"
                    @click="openLimits(account)">
                    Limits
                  </button>
                  <button v-if="account.status === 'ACTIVE'"
                    class="btn btn-danger" style="padding:0.3rem 0.75rem; font-size:0.8rem"
                    @click="closeAccount(account.accountId)">
                    Close
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="selectedAccount" class="modal-overlay" @click.self="selectedAccount = null">
      <div class="modal">
        <div class="modal-title">Update Limits</div>
        <div style="font-family:monospace; font-size:0.8rem; color:var(--muted); margin-bottom:1.5rem">
          {{ selectedAccount.iban }}
        </div>

        <div class="field">
          <label class="label">Daily limit</label>
          <input v-model.number="limitsForm.dailyLimit" type="number" class="input" />
        </div>
        <div class="field">
          <label class="label">Transfer limit</label>
          <input v-model.number="limitsForm.transferLimit" type="number" class="input" />
        </div>
        <div class="field">
          <label class="label">Absolute minimum</label>
          <input v-model.number="limitsForm.absoluteMinimum" type="number" class="input" />
        </div>

        <div style="display:flex; gap:0.75rem; margin-top:1.5rem">
          <button class="btn btn-gold"  style="flex:1" @click="saveLimits">Save</button>
          <button class="btn btn-ghost" style="flex:1" @click="selectedAccount = null">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/authStore.js'
import { useAccountStore } from '../../../stores/accountStore.js'

const router       = useRouter()
const authStore    = useAuthStore()
const accountStore = useAccountStore()

const selectedAccount = ref(null)
const limitsForm = ref({ dailyLimit: 0, transferLimit: 0, absoluteMinimum: 0 })

onMounted(() => accountStore.fetchAllAccounts())

function openLimits(account) {
  selectedAccount.value = account
  limitsForm.value = {
    dailyLimit:      account.dailyLimit,
    transferLimit:   account.transferLimit,
    absoluteMinimum: account.absoluteMinimum,
  }
}

async function saveLimits() {
  await accountStore.updateLimits(selectedAccount.value.accountId, limitsForm.value)
  selectedAccount.value = null
}

function closeAccount(accountId) {
  accountStore.closeAccount(accountId)
}

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>