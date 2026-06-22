<template>
  <div class="auth-page">
    <div class="auth-card atm-card">

      <div class="auth-logo">
        <span class="auth-logo-name">InhoBank</span>
        <span class="auth-logo-sub">ATM Terminal</span>
      </div>

      <!-- Balance display -->
      <div class="atm-balance">
        <div class="eyebrow">Available balance</div>
        <div class="atm-balance-fig figure">
          <span class="cur">€{{ accountBalance }}</span>
        </div>
      </div>

      <!-- Tab toggle -->
      <div class="atm-tabs" role="tablist">
        <button
          role="tab"
          class="atm-tab"
          :class="{ active: mode === 'withdraw' }"
          @click="switchMode('withdraw')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>
          Withdraw
        </button>
        <button
          role="tab"
          class="atm-tab"
          :class="{ active: mode === 'deposit' }"
          @click="switchMode('deposit')"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M12 5v14"/><path d="m5 12 7 7 7-7"/></svg>
          Deposit
        </button>
      </div>

      <!-- Alerts -->
      <div v-if="error" class="alert alert-error">⚠ {{ error }}</div>
      <div v-if="success" class="alert alert-success">✓ {{ success }}</div>

      <!-- Amount field -->
      <div class="field" style="margin-top: 0.25rem">
        <label class="label">Amount</label>
        <div class="input-prefix-wrap">
          <span class="input-prefix">€</span>
          <input
            ref="amountInput"
            v-model="amountRaw"
            type="number"
            min="0.01"
            step="0.01"
            class="input input-prefixed"
            placeholder="0.00"
            inputmode="decimal"
            :disabled="submitting"
            @input="clearAlerts"
            @keydown.enter="submit"
          />
        </div>
      </div>

      <!-- Submit -->
      <button
        type="button"
        class="btn"
        :class="mode === 'withdraw' ? 'btn-dark' : 'btn-gold'"
        style="width:100%; margin-top:0.25rem"
        :disabled="!canSubmit || submitting"
        @click="submit"
      >
        <span v-if="submitting" class="spinner"></span>
        {{ submitting ? 'Processing…' : mode === 'withdraw' ? 'Withdraw funds' : 'Deposit funds' }}
      </button>

      <!-- Session log -->
      <div v-if="sessionLog.length" class="atm-log">
        <div class="eyebrow" style="margin-bottom: 10px">This session</div>
        <div v-for="entry in sessionLog" :key="entry.id" class="atm-log-row">
          <span class="atm-log-type" :class="entry.type">
            {{ entry.type === 'withdraw' ? '↑' : '↓' }} {{ entry.type === 'withdraw' ? 'Withdrawal' : 'Deposit' }}
          </span>
          <span class="atm-log-right">
            <span class="atm-log-amt" :class="entry.type">
              {{ entry.type === 'withdraw' ? '−' : '+' }}€{{ entry.amount.toFixed(2) }}
            </span>
            <span class="atm-log-time">{{ entry.time }}</span>
          </span>
        </div>
      </div>

      <p class="auth-divider" style="margin-top: 1.5rem">
        <a style="cursor:pointer" @click="handleExit">End session &amp; sign out</a>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useAtmStore } from '../../../stores/atmStore.js'
import { post } from '../../../utils/api.js'

const router    = useRouter()
const atmStore = useAtmStore()

const account = computed(() => atmStore.account)

// Simplified computed helpers reading from the store
const accountBalance      = computed(() => account.value?.balance ?? 0)
const accountMinimum      = computed(() => account.value?.absoluteMinimum ?? 0)
const accountDailyLimit   = computed(() => account.value?.dailyLimit ?? 0)
const accountStatus       = computed(() => account.value?.status ?? '')
const accountIban         = computed(() => account.value?.iban ?? '')
const accountType         = computed(() => account.value?.accountType ?? '')

/* ---------- Mode ---------- */
const mode = ref('withdraw')
const amountRaw = ref('')
const amountInput = ref(null)
const submitting = ref(false)
const error = ref('')
const success = ref('')

function switchMode(next) {
  mode.value = next
  amountRaw.value = ''
  clearAlerts()
  nextTick(() => amountInput.value?.focus())
}

function clearAlerts() {
  error.value = ''
  success.value = ''
}

function setAmount(amt) {
  amountRaw.value = String(amt)
  clearAlerts()
}

const parsedAmount = computed(() => {
  const n = parseFloat(amountRaw.value)
  return Number.isFinite(n) && n > 0 ? n : 0
})

const canSubmit = computed(() => {
  if (parsedAmount.value <= 0) return false
  if (account.value === null) return false
  if (mode.value === 'withdraw') {
    return parsedAmount.value <= accountBalance.value - accountMinimum.value
  }
  return true
})

/* ---------- Session log ---------- */
const sessionLog = ref([])
let logId = 0

/* ---------- Submit ---------- */
async function submit() {
  if (!canSubmit.value || submitting.value || !account.value) return
  submitting.value = true
  clearAlerts()

  const amount = parsedAmount.value

  try {
    const response = await post('/api/transactions', {
  fromAccountId:  mode.value === 'withdraw' ? account.value.accountId : null,
  toAccountId:    mode.value === 'deposit'  ? account.value.accountId : null,
  transferAmount: amount,
  description:    mode.value === 'withdraw' ? 'ATM withdrawal' : 'ATM deposit',
}, {
  headers: {
    Authorization: `Bearer ${atmStore.token}`
  }
})

    if (!response.ok) {
      const data = await response.json()
      throw new Error(data.error || 'Transaction failed')
    }

    const data = await response.json()
// Update balance locally since the transaction response doesn't include it
if (mode.value === 'withdraw') {
  atmStore.account.balance -= amount
} else {
  atmStore.account.balance += amount
}

    sessionLog.value.unshift({
      id: ++logId,
      type: mode.value,
      amount,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    })

    success.value =
      mode.value === 'withdraw'
        ? `€${amount.toFixed(2)} withdrawn successfully.`
        : `€${amount.toFixed(2)} deposited successfully.`
    amountRaw.value = ''
  } catch (e) {
    error.value = e.message || 'Transaction could not be completed.'
  } finally {
    submitting.value = false
  }
}

function handleExit() {
  atmStore.logout()
  router.push('/atm-login')
}
</script>

<style scoped>
.atm-card {
  max-width: 420px;
  width: 100%;
}

.atm-balance {
  text-align: center;
  padding: 20px 0 24px;
  border-bottom: 1px solid #B08A4A;
  margin-bottom: 20px;
}

.atm-balance-fig {
  font-size: 48px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 6px 0 10px;
  color: #B08A4A;
}

.atm-balance-fig .cur {
  font-size: 28px;
  vertical-align: super;
  opacity: 0.6;
}

.atm-balance-fig .cents {
  font-size: 28px;
  opacity: 0.55;
}

.atm-meta {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 4px;
}

.atm-iban {
  font-family: monospace;
  font-size: 13px;
  color: var(--ink-mute, #8a9099);
}

/* Tabs */
.atm-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 6px;
  background: rgba(26,34,48,0.05);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.atm-tab {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 10px;
  border: none;
  border-radius: 9px;
  background: transparent;
  font-size: 14px;
  font-weight: 600;
  color: var(--ink-mute, #8a9099);
  cursor: pointer;
  transition: background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease;
}
.atm-tab svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}
.atm-tab.active {
  background: #fff;
  color: var(--ink, #B08A4A);
  box-shadow: 0 1px 4px rgba(26,34,48,0.12);
}
.atm-tab:focus-visible {
  outline: 2px solid #B08A4A;
  outline-offset: 2px;
}

/* Prefixed input */
.input-prefix-wrap {
  position: relative;
}
.input-prefix {
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--ink-mute, #8a9099);
  font-weight: 600;
  pointer-events: none;
  font-size: 15px;
}
.input-prefixed {
  padding-left: 28px !important;
}
input[type=number]::-webkit-outer-spin-button,
input[type=number]::-webkit-inner-spin-button {
  -webkit-appearance: none;
}

/* Quick amounts */
.quick-amounts {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin: 12px 0;
}
.quick-amt {
  padding: 9px 4px;
  border-radius: 8px;
  border: 1px solid rgba(26,34,48,0.12);
  background: transparent;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  color: var(--ink, #B08A4A);
  transition: border-color 0.15s, background 0.15s;
}
.quick-amt:hover:not(:disabled) {
  border-color: #B08A4A;
  background: rgba(176,138,74,0.06);
}
.quick-amt:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Dark button for withdraw */
.btn-dark {
  background: #1A2230;
  color: #FBF7EE;
}
.btn-dark:hover:not(:disabled) {
  background: #263040;
}
.btn-dark:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

/* Session log */
.atm-log {
  margin-top: 24px;
  padding-top: 20px;
  border-top: 1px solid rgba(26,34,48,0.08);
}
.atm-log-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 9px 0;
  border-bottom: 1px solid rgba(26,34,48,0.05);
  font-size: 13.5px;
}
.atm-log-row:last-child { border-bottom: none; }

.atm-log-type {
  font-weight: 600;
}
.atm-log-type.withdraw { color: var(--ink, #1A2230); }
.atm-log-type.deposit  { color: #2E6B4F; }

.atm-log-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
.atm-log-amt {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}
.atm-log-amt.withdraw { color: var(--ink, #1A2230); }
.atm-log-amt.deposit  { color: #2E6B4F; }

.atm-log-time {
  color: var(--ink-mute, #8a9099);
  font-size: 12px;
}

.alert-success {
  background: rgba(46,107,79,0.08);
  color: #2E6B4F;
  border: 1px solid rgba(46,107,79,0.25);
  border-radius: 10px;
  padding: 11px 14px;
  font-size: 13.5px;
  margin-bottom: 0.75rem;
}
</style>