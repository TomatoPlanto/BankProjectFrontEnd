// stores/atmStore.js
import { defineStore } from 'pinia'

export const useAtmStore = defineStore('atm', {
  state: () => ({
    token:   localStorage.getItem('atm_token') || null,
    account: null,
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    balance:    (state) => state.account?.balance ?? 0,
  },

  actions: {
    login(data) {
      this.token = data.token
      this.account = {
        accountId:       data.accountId,
        iban:            data.iban,
        accountType:     data.accountType,
        balance:         data.balance,
        dailyLimit:      data.dailyLimit,
        transferLimit:   data.transferLimit,
        absoluteMinimum: data.absoluteMinimum,
        status:          data.status,
      }
      localStorage.setItem('atm_token', data.token)
    },

    logout() {
      this.token   = null
      this.account = null
      localStorage.removeItem('atm_token')
    },
  },
})