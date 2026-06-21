<template>
  <div class="app">
    <aside class="sidebar">
      <div class="brand">
        <div class="crest"><span>IB</span></div>
        <div class="brand-text">
          <div class="brand-name">InhoBank</div>
          <div class="brand-sub">Est. 1888 · Private</div>
        </div>
      </div>
      <nav class="nav">
        <div class="nav-label">Banking</div>
        <RouterLink to="/dashboard" class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9.5 12 4l9 5.5"/><path d="M5 10v9h14v-9"/><path d="M9 19v-5h6v5"/></svg>
          Overview
        </RouterLink>
        <RouterLink to="/transfer" class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 7h11"/><path d="M14 3l4 4-4 4"/><path d="M17 17H6"/><path d="M10 21l-4-4 4-4"/></svg>
          Transfer
        </RouterLink>
        
        <div class="nav-label">Management</div>
        <RouterLink to="/accounts" class="nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
          Accounts
        </RouterLink>
        <RouterLink to="/users" class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>
          Users
        </RouterLink>
      </nav>
      <div class="sidebar-foot">
        <div class="member">
          <div class="eyebrow">Access</div>
          <div class="member-line">Employee Portal</div>
          <div class="member-since">InhoBank Staff</div>
        </div>
        <div class="foot-links">
          <a @click="handleLogout" style="cursor:pointer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 17l5-5-5-5"/><path d="M21 12H9"/><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/></svg>
            Sign out
          </a>
        </div>
      </div>
    </aside>

    <main class="main">
      <header class="topbar">
        <div class="greeting">
          <div class="hello">Accounts</div>
          <div class="date">Manage customer accounts and limits</div>
        </div>
        <div class="topbar-actions">
          <div class="avatar">EM</div>
        </div>
      </header>

      <div v-if="accountStore.loading" class="loading-state">Loading accounts…</div>
      <div v-if="accountStore.error"   class="alert alert-error">⚠ {{ accountStore.error }}</div>
      <div v-if="accountStore.success" class="alert alert-success">✓ {{ accountStore.success }}</div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Customer</th>
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
              <td style="font-weight:600">{{ account.ownerName }}</td>
              <td style="font-family:monospace; font-size:12px">{{ account.iban }}</td>
              <td>
                <span :class="account.accountType === 'CHECKING' ? 'badge badge-blue' : 'badge badge-purple'">
                  {{ account.accountType }}
                </span>
              </td>
              <td style="font-weight:600; color:var(--gold-deep)">€{{ Number(account.balance).toFixed(2) }}</td>
              <td>€{{ account.dailyLimit }}</td>
              <td>€{{ account.transferLimit }}</td>
              <td>
                <span :class="account.status === 'ACTIVE' ? 'badge badge-green' : 'badge badge-red'">
                  {{ account.status }}
                </span>
              </td>
              <td>
                <div style="display:flex; gap:0.5rem">
                  <button class="btn btn-ghost btn-sm" @click="openLimits(account)">Limits</button>
                  <button v-if="account.status === 'ACTIVE'" class="btn btn-danger btn-sm" @click="closeAccount(account.accountId)">Close</button>
                </div>
              </td>
            </tr>
            <tr v-if="!accountStore.accounts.length && !accountStore.loading">
              <td colspan="8" class="empty-state">No accounts found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>

    <div v-if="selectedAccount" class="modal-overlay" @click.self="selectedAccount = null">
      <div class="modal">
        <div class="modal-title">Update Limits</div>
        <div style="font-family:monospace; font-size:12px; color:var(--ink-mute); margin-bottom:1.5rem">
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
          <button class="btn btn-gold" style="flex:1" @click="saveLimits">Save</button>
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

function closeAccount(id) { accountStore.closeAccount(id) }
function handleLogout() { authStore.logout(); router.push('/login') }
</script>