import { defineStore } from 'pinia'
import { authService } from '../services/authService.js'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token:  localStorage.getItem('token')  || null,
    role:   localStorage.getItem('role')   || null,
    email:  localStorage.getItem('email')  || null,
    userId: localStorage.getItem('userId') || null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isEmployee: (state) => state.role === 'EMPLOYEE',
    isCustomer: (state) => state.role === 'CUSTOMER',
  },

  actions: {
    async login(email, password) {
      const data = await authService.login(email, password)
      this.token  = data.token
      this.role   = data.role
      this.email  = data.email
      this.userId = data.userId
      localStorage.setItem('token',  data.token)
      localStorage.setItem('role',   data.role)
      localStorage.setItem('email',  data.email)
      localStorage.setItem('userId', data.userId)
    },

    async register(userData) {
      return authService.register(userData)
    },

    logout() {
      this.token  = null
      this.role   = null
      this.email  = null
      this.userId = null
      localStorage.removeItem('token')
      localStorage.removeItem('role')
      localStorage.removeItem('email')
      localStorage.removeItem('userId')
    },
  },
})