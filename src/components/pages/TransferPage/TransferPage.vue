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
        <RouterLink to="/transfer" class="nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M7 7h11"/><path d="M14 3l4 4-4 4"/><path d="M17 17H6"/><path d="M10 21l-4-4 4-4"/></svg>
          Transfer
        </RouterLink>
        <template v-if="authStore.isEmployee">
          <div class="nav-label">Management</div>
          <RouterLink to="/accounts" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
            Accounts
          </RouterLink>
          <RouterLink to="/users" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>
            Users
          </RouterLink>
        </template>
      </nav>

      <div class="sidebar-foot">
        <div class="member">
          <div class="eyebrow">Membership</div>
          <div class="member-line">{{ authStore.isEmployee ? 'Employee Portal' : 'Private Client · Tier I' }}</div>
          <div class="member-since">{{ authStore.isEmployee ? 'InhoBank Staff' : 'Member since ' + memberSince }}</div>
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
          <div class="hello">Make a Transfer</div>
          <div class="date">Send money to another account</div>
        </div>
        <div class="topbar-actions">
          <div class="avatar">{{ initials }}</div>
        </div>
      </header>

      <div v-if="error" class="alert alert-error">⚠ {{ error }}</div>
      <div v-if="success" class="alert alert-success">✓ Transfer completed.</div>

      <section class="panel" style="max-width:680px">
        <div class="panel-head">
          <div class="titles"><div class="panel-title">New Transfer</div></div>
        </div>

        <form @submit.prevent="handleSubmit">
          <!-- customers pick from their own accounts; employees search any account by name -->
          <div v-if="myAccounts.length" class="field">
            <label class="label">From account</label>
            <select v-model="form.fromIban" class="input" required>
              <option value="" disabled>Select one of your accounts</option>
              <option v-for="a in myAccounts" :key="a.accountId" :value="a.iban">
                {{ a.accountType }} — {{ a.iban }} (€{{ Number(a.balance).toFixed(2) }})
              </option>
            </select>
          </div>

          <template v-else>
            <div class="field">
              <label class="label">Find sender by name</label>
              <div class="recipient-search">
                <input v-model="senderQuery" class="input" placeholder="Type a name…" @input="searchSenders" />
                <ul v-if="senderResults.length" class="recipient-results">
                  <li v-for="r in senderResults" :key="r.accountId" @click="pickSender(r)">
                    <span class="r-name">{{ r.ownerName }}</span>
                    <span class="r-iban">{{ r.iban }}</span>
                  </li>
                </ul>
              </div>
            </div>
            <div class="field">
              <label class="label">From IBAN</label>
              <input v-model="form.fromIban" class="input" placeholder="Pick from search above, or paste an IBAN" required />
            </div>
          </template>

          <div class="field">
            <label class="label">Find recipient by name</label>
            <div class="recipient-search">
              <input v-model="recipientQuery" class="input" placeholder="Type a name…" @input="searchRecipients" />
              <ul v-if="recipientResults.length" class="recipient-results">
                <li v-for="r in recipientResults" :key="r.accountId" @click="pickRecipient(r)">
                  <span class="r-name">{{ r.ownerName }}</span>
                  <span class="r-iban">{{ r.iban }}</span>
                </li>
              </ul>
            </div>
          </div>

          <div class="field">
            <label class="label">To IBAN</label>
            <input v-model="form.toIban" class="input" placeholder="Pick from search above, or paste an IBAN" required />
          </div>

          <div class="field-row">
            <div class="field">
              <label class="label">Amount</label>
              <input type="number" min="0.01" step="0.01" max="10000" v-model="form.amount" class="input" required />
            </div>
            <div class="field">
              <label class="label">Description</label>
              <input v-model="form.description" class="input" placeholder="e.g. Rent" required />
            </div>
          </div>

          <button type="submit" class="btn btn-gold" style="width:100%; margin-top:0.5rem" :disabled="loading">
            <span v-if="loading" class="spinner"></span>
            {{ loading ? 'Processing…' : 'Make a transfer' }}
          </button>
        </form>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/authStore.js'
import { accountService } from '../../../services/accountService.js'
import { transactionService } from '../../../services/transactionService.js'
import { userService } from '../../../services/userService.js'

const router    = useRouter()
const authStore = useAuthStore()

const currentUser = ref(null)
const myAccounts  = ref([])

const form = ref({ fromIban: '', toIban: '', amount: 0, description: '' })

const recipientQuery   = ref('')
const recipientResults = ref([])

const senderQuery   = ref('')
const senderResults = ref([])

const error   = ref('')
const loading = ref(false)
const success = ref(false)

const initials = computed(() => {
  if (currentUser.value?.firstName)
    return (currentUser.value.firstName[0] + (currentUser.value.lastName?.[0] || '')).toUpperCase()
  return (authStore.email?.slice(0, 2) || '··').toUpperCase()
})

const memberSince = computed(() => {
  if (!currentUser.value?.createdAt) return new Date().getFullYear().toString()
  return new Date(currentUser.value.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
})

// shared: returns matching accounts, or [] on short query / error
async function searchAccounts(query) {
  if (query.trim().length < 2) return []
  try {
    return await accountService.searchByOwnerName(authStore.token, query.trim())
  } catch (e) {
    return []
  }
}

async function searchRecipients() {
  recipientResults.value = await searchAccounts(recipientQuery.value)
}
function pickRecipient(r) {
  form.value.toIban = r.iban
  recipientQuery.value = r.ownerName
  recipientResults.value = []
}

async function searchSenders() {
  senderResults.value = await searchAccounts(senderQuery.value)
}
function pickSender(r) {
  form.value.fromIban = r.iban
  senderQuery.value = r.ownerName
  senderResults.value = []
}

async function handleSubmit() {
  error.value = ''
  success.value = false
  loading.value = true
  
  try {
    const fromAcc = await accountService.getAccountByIban(authStore.token, form.value.fromIban)
    const toAcc   = await accountService.getAccountByIban(authStore.token, form.value.toIban)

    await transactionService.createTransaction(authStore.token, {
      fromAccountId: fromAcc.accountId,
      toAccountId: toAcc.accountId,
      transferAmount: form.value.amount,
      description: form.value.description,
    })

    success.value = true
    form.value = { fromIban: '', toIban: '', amount: 0, description: '' }
    recipientQuery.value = ''
  } catch (e) {
    error.value = e.message || 'Transfer failed'
  } finally {
    loading.value = false
  }
}

function handleLogout() { authStore.logout(); router.push('/login') }

onMounted(async () => {
  try {
    currentUser.value = await userService.getMe(authStore.token)
    if (authStore.isCustomer) {
      myAccounts.value = await accountService.getAccountsByUserId(authStore.token, currentUser.value.userId)
      const firstActive = myAccounts.value.find(a => a.status === 'ACTIVE')
      if (firstActive) form.value.fromIban = firstActive.iban
    }
  } catch (e) {
    error.value = e.message
  }
})
</script>

<style scoped>
.recipient-search { position: relative; }
.recipient-results {
  position: absolute; z-index: 10; left: 0; right: 0; top: calc(100% + 4px);
  margin: 0; padding: 4px; list-style: none;
  background: var(--cream-card); border: 1px solid var(--line);
  border-radius: var(--r-md); box-shadow: var(--shadow-soft);
  max-height: 220px; overflow-y: auto;
}
.recipient-results li {
  display: flex; justify-content: space-between; align-items: center; gap: 12px;
  padding: 9px 12px; border-radius: var(--r-sm); cursor: pointer;
}
.recipient-results li:hover { background: var(--cream-soft); }
.r-name { font-weight: 600; color: var(--ink); }
.r-iban { font-size: 12px; color: var(--ink-mute); font-variant-numeric: tabular-nums; }
</style>