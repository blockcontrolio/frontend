<script>
import {fetchAccounts, sendTransfer} from '../services/api'

export default {
  data() {
    return {
      accounts: [], // should be populated externally
      transfer: {
        accountId: '',
        to: '',
        amount: null
      },
      errors: {
        to: '',
        amount: ''
      }
    };
  },
  computed: {
    selectedAccount() {
      return this.accounts.find(acc => acc.id === this.transfer.accountId);
    },
    hasErrors() {
      return !!this.errors.to || !!this.errors.amount;
    },
  },
  async mounted() {
    this.accounts = await fetchAccounts()
  },
  methods: {
    validateTo() {
      const hexRegex = /^0x[a-fA-F0-9]{6,}$/;
      if (!this.transfer.to) {
        this.errors.to = 'Address is required';
      } else if (!hexRegex.test(this.transfer.to)) {
        this.errors.to = 'Must be a valid hex string (e.g., 0x123abc...)';
      } else {
        this.errors.to = '';
      }
    },
    validateAmount() {
      const amountStr = this.transfer.amount?.toString();
      if (!amountStr || parseFloat(amountStr) <= 0) {
        this.errors.amount = 'Amount must be greater than zero';
        return;
      }
      const decimalPart = amountStr.split('.')[1];
      if (decimalPart && decimalPart.length > 18) {
        this.errors.amount = 'Amount must have at most 18 decimal places';
      } else {
        this.errors.amount = '';
      }
    },
    async submitTransfer() {
      this.validateTo();
      this.validateAmount();
      if (this.hasErrors) return; // proceed with sending the transfer request using fetch
      try {
        await sendTransfer(this.transfer)
        alert('Transfer submitted!')
        // optionally reset form
        this.transfer = {accountId: '', to: '', amount: null}
      } catch (err) {
        console.error(err)
        alert('Failed to submit transfer')
      }
    },
  }
};
</script>

<template>
  <h3 class="mb-3">Asset Transfer</h3>

  <div class="d-flex justify-content-center mt-5">
    <form @submit.prevent="submitTransfer" class="transfer-form bg-dark p-4 rounded shadow">
      <h3 class="mb-4 text-center">Make a Transfer</h3>

      <div class="mb-3">
        <label class="form-label">From Account</label>
        <select v-model="transfer.accountId" class="form-select bg-dark border-info" required>
          <option disabled value="">-- choose account --</option>
          <option v-for="acc in accounts" :key="acc.ref" :value="acc.id">
            {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
          </option>
        </select>
        <div v-if="selectedAccount" class="mt-1 text-info small"> Balance: {{ selectedAccount.balance }} ETH</div>
      </div>

      <div class="mb-3">
        <label class="form-label">To Address</label>
        <input
            v-model="transfer.to"
            class="form-control bg-dark border-info"
            placeholder="Recipient hex address"
            @input="validateTo"
        />
        <div v-if="errors.to" class="form-text text-danger">{{ errors.to }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Amount ETH</label>
        <input
            v-model="transfer.amount"
            type="number"
            step="0.000000000000000001"
            class="form-control bg-dark border-info no-spinner"
            placeholder="Amount to send"
            @input="validateAmount"
        />
        <div v-if="errors.amount" class="form-text text-danger">{{ errors.amount }}</div>
        <div v-if="selectedAccount" class="">
          <div v-if="transfer.amount && parseFloat(transfer.amount) > parseFloat(selectedAccount.balance)"
               class="form-text text-warning">Amount exceeds account balance!
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end">
        <button class="btn btn-outline-primary" :disabled="hasErrors">Send</button>
      </div>
    </form>
  </div>

</template>

<style scoped>
.transfer-form {
  width: 100%;
  max-width: 500px;
}

input::placeholder,
select {
  color: #ccc;
}

/* hide spinner arrows in number input */
input[type=number].no-spinner::-webkit-outer-spin-button,
input[type=number].no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
</style>
