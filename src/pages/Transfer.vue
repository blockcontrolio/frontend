<script>
import {fetchAccounts, sendExternalWithdrawal, sendInternalTransfer} from '../services/api'

export default {
  data() {
    return {
      selectedForm: 'internal', // or 'internal'
      accounts: [], // should be populated externally
      internal: {
        from: '',
        to: '',
        amount: null
      },
      transfer: {
        accountId: '',
        to: '',
        amount: null
      },
      errors: {
        to: '',
        amount: ''
      },
      transferSuccess: null,
      transferError: null,
    };
  },
  computed: {
    selectedAccount() {
      switch (this.selectedForm) {
        case "internal": {
          return this.accounts.find(acc => acc.id === this.internal.from);
        }
        case "external" : {
          return this.accounts.find(acc => acc.id === this.transfer.accountId);
        }
      }
    },
    availableTargetAccounts() {
      if (!this.internal.from) return this.accounts;
      return this.accounts.filter(acc => acc.id !== this.internal.from);
    },
    hasErrors() {
      return !!this.errors.to || !!this.errors.amount;
    },
  },
  mounted() {
    this.fetchAccounts();
  },
  methods: {
    async fetchAccounts() {
      let responsePromise = await fetchAccounts();
      this.accounts = await responsePromise.json();
    },
    validateTo() {
      const hexRegex = /^0x[a-fA-F0-9]{6,}$/;
      if (!this.transfer.to) {
        this.errors.to = 'Address is required';
      } else if (this.transfer.to.length !== 42) {
        this.errors.to = 'Hex string has invalid length';
      } else if (!hexRegex.test(this.transfer.to)) {
        this.errors.to = 'Must be a valid hex string (e.g., 0x123abc...)';
      } else {
        this.errors.to = '';
      }
    },
    validateAmount() {
      let amountStr;
      if (this.selectedForm === 'internal') {
        amountStr = this.internal.amount?.toString();
      } else if (this.selectedForm === 'external') {
        amountStr = this.transfer.amount?.toString();
      }
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
    async submitExternalWithdrawal() {
      this.resetError();
      this.validateTo();
      this.validateAmount();
      if (this.hasErrors) return; // proceed with sending the transfer request using fetch
      try {
        const response = await sendExternalWithdrawal(this.transfer)
        if (!response.ok) {
          const err = await response.json();
          this.handleTransferError(err);
        } else {
          this.transferSuccess = await response.json();
          // reset form
          this.transfer = {accountId: '', to: '', amount: null}
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    async submitInternalTransfer() {
      this.resetError();
      this.validateAmount();
      if (this.hasErrors) return; // proceed with sending the transfer request using fetch
      try {
        const response = await sendInternalTransfer(this.internal);
        if (!response.ok) {
          const err = await response.json();
          this.handleTransferError(err);
        } else {
          this.transferSuccess = await response.json();
          // reset form
          this.internal = {from: '', to: '', amount: null}
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    resetError() {
      this.transferSuccess = null;
      this.transferError = null;
    },
    handleUnknownError(err) {
      console.error(err)
      this.transferError = {
        error: 'Network Error',
        message: err.message
      };
    },
    handleTransferError(err) {
      this.transferError = {
        error: err.error || 'Error',
        message: err.message || 'Unknown error occurred.'
      };
    }
  }
};
</script>

<template>
  <h3 class="mb-3">Asset Transfer</h3>

  <div class="d-flex justify-content-center mt-5">
    <div class="type-selector">
      <div class="form-check form-check-inline">
        <input class="form-check-input bg-dark border-primary" type="radio" id="internalRadio" value="internal"
               v-on:change="resetError"
               v-model="selectedForm"/>
        <label class="form-check-label text-white fw-bold" for="internalRadio">Internal Transfer</label>
      </div>
      <div class="form-check form-check-inline me-3">
        <input class="form-check-input bg-dark border-primary" type="radio" id="externalRadio" value="external"
               v-on:change="resetError"
               v-model="selectedForm"/>
        <label class="form-check-label text-white fw-bold" for="externalRadio">External Withdrawal</label>
      </div>
    </div>
  </div>

  <div v-if="selectedForm === 'internal'" class="d-flex justify-content-center mt-5">
    <form @submit.prevent="submitInternalTransfer" class="transfer-form bg-dark p-4 rounded shadow">
      <h3 class="mb-4 text-center">Transfer between Accounts</h3>

      <!-- Source Account -->
      <div class="mb-3">
        <label class="form-label">From Account</label>
        <select v-model="internal.from" class="form-select bg-dark border-info" required>
          <option disabled value="">-- source account --</option>
          <option v-for="acc in accounts" :key="acc.ref" :value="acc.id">
            {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
          </option>
        </select>
        <div v-if="selectedAccount" class="mt-1 text-info small"> Balance: {{ selectedAccount.balance }} ETH</div>
      </div>

      <!-- Target Account -->
      <div class="mb-3">
        <label class="form-label">To Account</label>
        <select v-model="internal.to"
                class="form-select bg-dark border-info"
                required>
          <option disabled value="">-- target account --</option>
          <option v-for="acc in availableTargetAccounts" :key="acc.ref + '-to'" :value="acc.id">
            {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
          </option>
        </select>
      </div>

      <!-- Amount -->
      <div class="mb-3">
        <label class="form-label">Amount ETH</label>
        <input
            v-model="internal.amount"
            type="number"
            step="0.000000000000000001"
            class="form-control bg-dark border-info no-spinner text-white"
            placeholder="Amount to send"
            @input="validateAmount"
        />
        <div v-if="errors.amount" class="form-text text-danger">{{ errors.amount }}</div>
        <div v-if="selectedAccount" class="">
          <div v-if="internal.amount && parseFloat(internal.amount) > parseFloat(selectedAccount.balance)"
               class="form-text text-warning">Amount exceeds account balance!
          </div>
        </div>
      </div>

      <div class="d-flex justify-content-end">
        <button class="btn btn-outline-primary" :disabled="hasErrors">Send</button>
      </div>
    </form>
  </div>

  <div v-else-if="selectedForm === 'external'" class="d-flex justify-content-center mt-5">
    <form @submit.prevent="submitExternalWithdrawal" class="transfer-form bg-dark p-4 rounded shadow">
      <h3 class="mb-4 text-center">Withdraw to external Address</h3>

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
            class="form-control bg-dark border-info text-white"
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
            class="form-control bg-dark border-info no-spinner text-white"
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

  <!-- Success Message -->
  <div v-if="transferSuccess" class="alert custom-success-alert mt-3 text-white">
    ✅ You transferred {{ transferSuccess.amount }} ETH to {{ transferSuccess.to }}
    <br/>
    Tx hash: <code>{{ transferSuccess.txHash }}</code>
  </div>

  <!-- Error Message -->
  <div v-if="transferError" class="alert custom-error-alert mt-3">
    ❌ <strong>{{ transferError.error }}</strong><br/>
    <span>{{ transferError.message }}</span>
  </div>

</template>

<style scoped>
.type-selector,
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

.custom-success-alert {
  background-color: #111827;
  border-color: #2af2ff;
  border-radius: 0.375rem;
}

.custom-error-alert {
  background-color: #1f1f2e; /* deep space dark */
  border-color: #ff4c4c; /* electric red/orange */
  color: #ffcccc; /* light red text for readability */
  border-radius: 0.375rem;
}

</style>
