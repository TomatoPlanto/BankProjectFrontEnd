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
        <RouterLink to="/accounts" class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
          Accounts
        </RouterLink>
        <RouterLink to="/users" class="nav-item active">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="8" r="4"/><path d="M5 21c0-3.5 3-6 7-6s7 2.5 7 6"/></svg>
          Users
        </RouterLink>
        <RouterLink to="/transactions" class="nav-item">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18"/></svg>
          Transactions
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
          <div class="hello">Users</div>
          <div class="date">Approve, manage and close customer accounts</div>
        </div>
        <div class="topbar-actions">
          <div class="avatar">EM</div>
        </div>
      </header>

      <div style="margin-bottom: 1rem; display: flex; gap: 0.75rem;">
        <input
          v-model="searchQuery"
          class="input"
          placeholder="Search by name..."
          style="max-width: 300px;"
          @input="handleSearch"
        />
        <button v-if="searchQuery" class="btn btn-ghost" @click="clearSearch">Clear</button>
      </div>

      <div class="filter-tabs">
        <button v-for="tab in ['ALL','PENDING','ACTIVE','CLOSED']" :key="tab"
          class="btn" :class="filter === tab ? 'btn-gold' : 'btn-ghost'"
          style="padding:0.35rem 1rem; font-size:12px"
          @click="filter = tab">
          {{ tab }}
        </button>
      </div>

      <div v-if="userStore.loading" class="loading-state">Loading users…</div>
      <div v-if="userStore.error" class="alert alert-error">⚠ {{ userStore.error }}</div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Member since</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.userId">
              <td style="font-weight:600">{{ fullName(user) }}</td>
              <td style="color:var(--ink-mute)">{{ user.email }}</td>
              <td>
                <span :class="user.role === 'EMPLOYEE' ? 'badge badge-purple' : 'badge badge-blue'">
                  {{ user.role }}
                </span>
              </td>
              <td><span :class="statusBadge(user.status)">{{ user.status }}</span></td>
              <td style="color:var(--ink-mute); font-size:12px">{{ formatDate(user.createdAt) }}</td>
              <td>
                <div style="display:flex; gap:0.5rem">
                  <button v-if="user.status === 'PENDING'" class="btn btn-gold btn-sm" @click="approve(user.userId)">Approve</button>
                  <button v-if="user.status === 'ACTIVE'"  class="btn btn-danger btn-sm" @click="close(user.userId)">Close</button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0 && !userStore.loading">
              <td colspan="6" class="empty-state">No users found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../../stores/authStore.js'
import { useUserStore } from '../../../stores/userStore.js'

const router    = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const filter    = ref('ALL')
const searchQuery = ref('')

const filteredUsers = computed(() =>
  filter.value === 'ALL' ? userStore.users : userStore.users.filter(u => u.status === filter.value)
)

function handleSearch() {
  if (searchQuery.value.trim().length < 2) {
    userStore.fetchAllUsers()
    return
  }
  userStore.searchByName(searchQuery.value.trim())
}

function clearSearch() {
  searchQuery.value = ''
  userStore.fetchAllUsers()
}

function fullName(user) { return [user.firstName, user.infix, user.lastName].filter(Boolean).join(' ') }
function statusBadge(s) { return { ACTIVE:'badge badge-green', PENDING:'badge badge-gold', CLOSED:'badge badge-red' }[s] ?? 'badge' }
function formatDate(date) {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric' })
}

onMounted(() => userStore.fetchAllUsers())
function approve(id) { userStore.approveUser(id) }
function close(id)   { userStore.closeUser(id) }
function handleLogout() { authStore.logout(); router.push('/login') }
</script>