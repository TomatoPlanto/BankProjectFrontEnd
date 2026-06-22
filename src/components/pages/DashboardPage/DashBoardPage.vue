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
        <RouterLink to="/dashboard" class="nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M3 9.5 12 4l9 5.5"/><path d="M5 10v9h14v-9"/><path d="M9 19v-5h6v5"/></svg>
          Overview
        </RouterLink>
        
        <RouterLink to="/transfer" class="nav-item">
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
          <RouterLink to="/transactions" class="nav-item">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
            Transactions
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
          <div class="hello">Good {{ timeOfDay }}, {{ firstName }}</div>
          <div class="date">{{ today }}</div>
        </div>
        <div class="topbar-actions">
          <div class="avatar">{{ initials }}</div>
        </div>
      </header>

      <div v-if="loading" class="loading-state">Loading your accounts…</div>
      <div v-if="error" class="alert alert-error">⚠ {{ error }}</div>

      <template v-if="!loading && !error">
        <section class="hero">
          <div class="hero-main">
            <div class="eyebrow">Total Balance</div>
            <div class="balance figure">
              <span class="cur">€</span>{{ totalWhole }}<span class="cents">.{{ totalCents }}</span>
            </div>
            <div class="delta">
              <span class="pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 15 6-6 6 6"/></svg>
                Active accounts
              </span>
              {{ activeAccounts }} of {{ accounts.length }} active
            </div>
          </div>
          <div class="hero-stats">
            <div v-for="account in accounts" :key="account.accountId" class="hstat">
              <div class="k">{{ account.accountType === 'CHECKING' ? 'Current Account' : 'Reserve Savings' }}</div>
              <div class="v small">€{{ Number(account.balance).toFixed(2) }}</div>
            </div>
            <div class="hstat">
              <div class="k">Daily limit</div>
              <div class="v small">€{{ accounts[0]?.dailyLimit ?? '—' }}</div>
            </div>
            <div class="hstat">
              <div class="k">Transfer limit</div>
              <div class="v small">€{{ accounts[0]?.transferLimit ?? '—' }}</div>
            </div>
          </div>
        </section>

        <div class="grid">
          <div class="col">
            <!-- Accounts -->
            <section class="panel">
              <div class="panel-head">
                <div class="titles"><div class="panel-title">Your Accounts</div></div>
              </div>
              <div v-for="account in accounts" :key="account.accountId" class="acct">
                <div class="acct-ico">
                  <svg v-if="account.accountType === 'CHECKING'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </div>
                <div class="acct-info">
                  <RouterLink :to="{ name: 'account', params: { accountId:  account.accountId}}">
                    <div class="acct-name">{{ account.accountType === 'CHECKING' ? 'Current Account' : 'Reserve Savings' }}</div>
                  </RouterLink>    
                  <div class="acct-meta">{{ account.iban }}</div>
                </div>
                <div class="acct-amt">
                  <div class="a figure">€{{ Number(account.balance).toFixed(2) }}</div>
                  <div class="c">
                    <span :class="account.status === 'ACTIVE' ? 'badge badge-green' : 'badge badge-red'">{{ account.status }}</span>
                  </div>
                </div>
              </div>
            </section>

            <!-- Graph -->
            <section class="panel">
              <div class="panel-head">
                <div class="titles">
                  <div class="eyebrow">Last 12 months</div>
                  <div class="panel-title">Activity Overview</div>
                </div>
              </div>
              <div class="chart-figs">
                <div class="chart-val figure">€{{ totalWhole }}.{{ totalCents }}</div>
                <span class="pill" style="background:rgba(46,107,79,0.1);color:var(--pos);border:1px solid rgba(46,107,79,0.25);font-size:12px;padding:4px 10px">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="m6 15 6-6 6 6"/></svg>
                  12 months
                </span>
              </div>
              <div class="chart-wrap">
                <svg class="chart-svg" viewBox="0 0 560 140" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stop-color="#B08A4A" stop-opacity="0.28"/>
                      <stop offset="100%" stop-color="#B08A4A" stop-opacity="0"/>
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="35"  x2="560" y2="35"  stroke="rgba(26,34,48,0.06)"/>
                  <line x1="0" y1="70"  x2="560" y2="70"  stroke="rgba(26,34,48,0.06)"/>
                  <line x1="0" y1="105" x2="560" y2="105" stroke="rgba(26,34,48,0.06)"/>
                  <path :d="chartFillPath" fill="url(#chartFill)"/>
                  <path :d="chartLinePath" fill="none" stroke="#B08A4A" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>
                  <circle v-if="chartPts.length"
                    :cx="chartPts[chartPts.length-1].x"
                    :cy="chartPts[chartPts.length-1].y"
                    r="5" fill="#B08A4A" stroke="#FBF7EE" stroke-width="2.5"/>
                </svg>
                <div class="chart-months">
                  <span v-for="m in monthLabels" :key="m">{{ m }}</span>
                </div>
              </div>
            </section>
          </div>

          <!-- Right column -->
          <div class="col">
            <!-- Card -->
            <div class="credit">
              <div class="credit-top">
                <div>
                  <div class="credit-brand">InhoBank</div>
                  <div class="credit-tier">Private Reserve</div>
                </div>
                <div class="credit-emblem">IB</div>
              </div>
              <div class="credit-mid">
                <div class="chip"></div>
                <div class="contactless">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M8.5 8.5a6 6 0 0 1 0 7"/>
                    <path d="M11.5 5.5a10 10 0 0 1 0 13"/>
                    <path d="M14.5 2.5a14 14 0 0 1 0 19"/>
                  </svg>
                </div>
              </div>
              <div class="credit-num figure">{{ maskedIban }}</div>
              <div class="credit-bottom">
                <div>
                  <div class="cl">Cardholder</div>
                  <div class="cv serif">{{ fullName }}</div>
                </div>
                <div style="text-align:right">
                  <div class="cl">Member since</div>
                  <div class="cv">{{ memberSince }}</div>
                </div>
              </div>
            </div>

            <!-- Quick actions -->
            <section class="panel">
              <div class="panel-head">
                <div class="titles"><div class="panel-title">Quick Actions</div></div>
              </div>
              <div class="actions">
                <template v-if="authStore.isEmployee">
                  <RouterLink to="/accounts" class="action">
                    <div class="action-ico">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
                    </div>
                    <span>Accounts</span>
                  </RouterLink>
                  <RouterLink to="/users" class="action">
                    <div class="action-ico">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>
                    </div>
                    <span>Users</span>
                  </RouterLink>
                </template>
                
                <div class="action">
                  <div class="action-ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                  </div>
                  <span>Statements</span>
                </div>
                <RouterLink to="/transfer" class="action">
                  <div class="action-ico">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </div>
                  <span>Transfer</span>
                </RouterLink>       
              </div>
            </section>

            <!-- Limits -->
            <section class="panel">
              <div class="panel-head">
                <div class="titles"><div class="panel-title">Account Limits</div></div>
              </div>
              <div v-for="account in accounts" :key="'lim-'+account.accountId" class="acct">
                <div class="acct-ico">
                  <svg v-if="account.accountType === 'CHECKING'" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
                  <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
                </div>
                <div class="acct-info">
                  <div class="acct-name">{{ account.accountType === 'CHECKING' ? 'Current' : 'Savings' }}</div>
                  <div class="acct-meta">Daily €{{ account.dailyLimit }} · Transfer €{{ account.transferLimit }}</div>
                </div>
                <div class="acct-amt">
                  <div class="c">Min. €{{ account.absoluteMinimum }}</div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </template>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/authStore.js'
import { accountService } from '../../../services/accountService.js'
import { userService } from '../../../services/userService.js'
import { transactionService } from '../../../services/transactionService.js'

const router      = useRouter()
const authStore   = useAuthStore()
const accounts    = ref([])
const currentUser = ref(null)
const loading     = ref(true)
const error       = ref('')

// monthly activity totals for the graph, filled from real transactions on load
const volumes = ref(new Array(12).fill(0))

const firstName = computed(() => {
  if (currentUser.value?.firstName) return currentUser.value.firstName
  const n = authStore.email?.split('@')[0] || ''
  return n.charAt(0).toUpperCase() + n.slice(1)
})

const fullName = computed(() => {
  if (!currentUser.value) return firstName.value
  return [currentUser.value.firstName, currentUser.value.infix, currentUser.value.lastName]
    .filter(Boolean).join(' ')
})

const initials = computed(() => {
  if (currentUser.value?.firstName)
    return (currentUser.value.firstName[0] + (currentUser.value.lastName?.[0] || '')).toUpperCase()
  return firstName.value.slice(0, 2).toUpperCase()
})

const memberSince = computed(() => {
  if (!currentUser.value?.createdAt) return new Date().getFullYear().toString()
  return new Date(currentUser.value.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
})

const maskedIban = computed(() => {
  const iban = accounts.value[0]?.iban
  if (!iban) return '···· ···· ···· ····'
  return `${iban.slice(0,4)} ···· ···· ${iban.slice(-4)}`
})

const activeAccounts = computed(() => accounts.value.filter(a => a.status === 'ACTIVE').length)
const timeOfDay      = computed(() => { const h = new Date().getHours(); return h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening' })
const today          = computed(() => new Date().toLocaleDateString('en-GB', { weekday:'long', day:'numeric', month:'long', year:'numeric' }))
const totalBalance   = computed(() => accounts.value.reduce((s, a) => s + Number(a.balance), 0))
const totalWhole     = computed(() => Math.floor(totalBalance.value).toLocaleString('en'))
const totalCents     = computed(() => (totalBalance.value % 1).toFixed(2).slice(2))

const chartPts = computed(() => {
  const vals = volumes.value
  const max = Math.max(...vals), min = Math.min(...vals), range = max - min || 1
  return vals.map((v, i) => ({
    x: (i / (vals.length - 1)) * 560,
    y: 10 + (1 - (v - min) / range) * 120,
  }))
})

const chartLinePath = computed(() =>
  chartPts.value.reduce((d, p, i) => {
    if (i === 0) return `M${p.x},${p.y}`
    const prev = chartPts.value[i - 1]
    const cpx = (prev.x + p.x) / 2
    return `${d} C${cpx},${prev.y} ${cpx},${p.y} ${p.x},${p.y}`
  }, '')
)

const chartFillPath = computed(() => {
  const pts = chartPts.value
  if (!pts.length) return ''
  return `${chartLinePath.value} L${pts[pts.length-1].x},140 L0,140 Z`
})

const monthLabels = computed(() => {
  const labels = []
  for (let i = 11; i >= 0; i--) {
    const d = new Date()
    d.setMonth(d.getMonth() - i)
    labels.push(d.toLocaleDateString('en-GB', { month: 'short' }))
  }
  return labels
})

// sum each account's transactions into 12 monthly buckets (oldest -> current month)
async function loadChart() {
  const buckets = new Array(12).fill(0)
  const now = new Date()
  const nowIdx = now.getFullYear() * 12 + now.getMonth()
  
  for (const acc of accounts.value.slice(0, 6)) {
    try {
      const page = await transactionService.getTransactions(authStore.token, acc.accountId, 0, 500, '', false, null)
      for (const t of page.content) {
        const d = new Date(t.createdAt)
        const monthsAgo = nowIdx - (d.getFullYear() * 12 + d.getMonth())
        if (monthsAgo >= 0 && monthsAgo <= 11) buckets[11 - monthsAgo] += Number(t.amount)
      }
    } catch (e) {
      // skip accounts we can't read so the chart still renders
    }
  }
  volumes.value = buckets
}

onMounted(async () => {
  try {
    currentUser.value = await userService.getMe(authStore.token)
    if (authStore.isCustomer) {
      accounts.value = await accountService.getAccountsByUserId(authStore.token, currentUser.value.userId)
    } else {
      accounts.value = (await accountService.getAllAccounts(authStore.token)).content
    }
    await loadChart()
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>