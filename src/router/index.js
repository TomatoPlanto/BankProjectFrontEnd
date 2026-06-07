import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore.js'

import LoginPage     from '../components/pages/LoginPage/LoginPage.vue'
import AtmLoginPage  from '../components/pages/AtmLoginPage/AtmLoginPage.vue'
import RegisterPage  from '../components/pages/RegisterPage/RegisterPage.vue'
import DashboardPage from '../components/pages/DashboardPage/DashBoardPage.vue'
import AccountsPage  from '../components/pages/AccountsPage/AccountsPage.vue'
import UsersPage     from '../components/pages/UsersPage/UsersPage.vue'

const routes = [
  { path: '/',          redirect: '/login' },
  { path: '/login',     component: LoginPage,     meta: { public: true } },
  { path: '/atm-login', component: AtmLoginPage,  meta: { public: true } },
  { path: '/register',  component: RegisterPage,  meta: { public: true } },
  { path: '/dashboard', component: DashboardPage, meta: { requiresAuth: true } },
  { path: '/accounts',  component: AccountsPage,  meta: { requiresAuth: true, employeeOnly: true } },
  { path: '/users',     component: UsersPage,     meta: { requiresAuth: true, employeeOnly: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  if (to.meta.requiresAuth && !authStore.isLoggedIn) return next('/login')
  if (to.meta.public && authStore.isLoggedIn) return next('/dashboard')
  if (to.meta.employeeOnly && !authStore.isEmployee) return next('/dashboard')
  next()
})

export default router