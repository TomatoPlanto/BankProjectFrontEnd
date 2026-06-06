<template>
  <div class="page">
    <nav class="navbar">
      <span class="navbar-brand">InhoBank</span>
      <div class="navbar-links">
        <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
        <RouterLink to="/accounts"  class="nav-link">Accounts</RouterLink>
        <button class="btn btn-danger" style="padding:0.4rem 1rem" @click="handleLogout">Sign out</button>
      </div>
    </nav>

    <div class="page-content">
      <h1 class="page-title">Users</h1>

      <div style="display:flex; gap:0.5rem; margin-bottom:1.5rem">
        <button v-for="tab in ['ALL','PENDING','ACTIVE','CLOSED']" :key="tab"
          class="btn" :class="filter === tab ? 'btn-gold' : 'btn-ghost'"
          style="padding:0.4rem 1rem; font-size:0.8rem"
          @click="filter = tab">
          {{ tab }}
        </button>
      </div>

      <div v-if="userStore.loading" style="color:var(--muted); padding:3rem 0">Loading…</div>
      <div v-if="userStore.error"   class="alert alert-error">⚠ {{ userStore.error }}</div>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in filteredUsers" :key="user.userId">
              <td style="font-weight:500">{{ fullName(user) }}</td>
              <td style="color:var(--muted)">{{ user.email }}</td>
              <td>
                <span :class="user.role === 'EMPLOYEE' ? 'badge badge-purple' : 'badge badge-blue'">
                  {{ user.role }}
                </span>
              </td>
              <td>
                <span :class="statusBadge(user.status)">{{ user.status }}</span>
              </td>
              <td>
                <div style="display:flex; gap:0.5rem">
                  <button v-if="user.status === 'PENDING'"
                    class="btn btn-gold" style="padding:0.3rem 0.75rem; font-size:0.8rem"
                    @click="approve(user.userId)">
                    Approve
                  </button>
                  <button v-if="user.status === 'ACTIVE'"
                    class="btn btn-danger" style="padding:0.3rem 0.75rem; font-size:0.8rem"
                    @click="close(user.userId)">
                    Close
                  </button>
                </div>
              </td>
            </tr>
            <tr v-if="filteredUsers.length === 0">
              <td colspan="5" style="text-align:center; color:var(--muted); padding:2rem">No users found</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
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

const filter = ref('ALL')

const filteredUsers = computed(() => {
  if (filter.value === 'ALL') return userStore.users
  return userStore.users.filter(u => u.status === filter.value)
})

function fullName(user) {
  return [user.firstName, user.infix, user.lastName].filter(Boolean).join(' ')
}

function statusBadge(status) {
  const map = { ACTIVE:'badge badge-green', PENDING:'badge badge-gold', CLOSED:'badge badge-red' }
  return map[status] ?? 'badge'
}

onMounted(() => userStore.fetchAllUsers())

function approve(userId) { userStore.approveUser(userId) }
function close(userId)   { userStore.closeUser(userId) }

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>