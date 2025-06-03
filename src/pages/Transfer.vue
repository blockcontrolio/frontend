<script>
import {
  fetchAccounts,
  fetchBalances,
  fetchTokens,
  sendExternalWithdrawal,
  sendInternalTransfer
} from '../services/api'
import {formatAmount} from "../js/utils.js";
import TxToast from "../components/toast/TxToast.vue";
import ErrorToast from "../components/toast/ErrorToast.vue";

export default {
  components: {
    TxToast,
    ErrorToast
  },
  data() {
    return {
      selectedForm: 'internal', // or 'internal'
      accounts: [], // should be populated externally
      internal: {
        from: "",
        tokenId: "",
        to: "",
        amount: null
      },
      transfer: {
        accountId: "",
        tokenId: "",
        to: "",
        amount: null
      },
      tokens: [], // fetched from API
      errors: {
        to: "",
        amount: ""
      },
      transferSuccess: null,
      transferError: null,
      accountBalances: [],
      selectedAsset: null,
      selectedTokenInfo: null
    };
  },
  computed: {
    availableTargetAccounts() {
      if (!this.internal.from) return this.accounts;
      return this.accounts.filter(acc => acc.id !== this.internal.from);
    },
    hasErrors() {
      return !!this.errors.to || !!this.errors.amount;
    },
  },
  mounted() {
    this.fetchTokens();
    this.fetchAccounts();
  },
  methods: {
    formatAmount,
    async fetchTokens() {
      const res = await fetchTokens()
      this.tokens = await res.json();
    },
    async fetchAccounts() {
      let res = await fetchAccounts();
      this.accounts = await res.json();
    },
    async fetchBalances(accountId) {
      let res = await fetchBalances(accountId);
      this.accountBalances = await res.json();
    },
    showBalance(assetId) {
      this.selectedAsset = this.accountBalances
          .find(b => b.id === assetId)
      console.log("Selected asset: ", this.selectedAsset.symbol)
      this.selectedToken(assetId)
    },
    selectedToken(assetId) {
      this.selectedTokenInfo = this.tokens
          .find(t => t.id === assetId);
      console.log("Selected token info: ", this.selectedTokenInfo.id)
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
          await this.handleSuccess(response);
          // reset form
          this.transfer = {accountId: '', to: '', amount: null}
          this.selectedTokenInfo = null
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
          await this.handleSuccess(response);
          // reset form
          this.internal = {from: '', to: '', amount: null}
          this.selectedTokenInfo = null
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    resetSelection() {
      this.selectedTokenInfo = null;
      this.selectedAsset = null;
      this.accountBalances = [];
    },
    resetError() {
      this.transferSuccess = null;
      this.transferError = null;
      this.errors.to = '';
      this.errors.amount = '';
    },
    async handleSuccess(response) {
      let txData = await response.json();
      let message = `You transferred ${txData.amount} ${this.selectedAsset?.name} (${this.selectedAsset?.symbol}) to ${txData.to}`
      this.transferSuccess = {hash: txData.txHash, message};
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
               v-on:change="this.resetSelection(); this.resetError();"
               v-model="selectedForm"/>
        <label class="form-check-label text-white fw-bold" for="internalRadio">Internal Transfer</label>
      </div>
      <div class="form-check form-check-inline me-3">
        <input class="form-check-input bg-dark border-primary" type="radio" id="externalRadio" value="external"
               v-on:change="this.resetSelection(); this.resetError();"
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
        <select v-model="internal.from" class="form-select bg-dark border-info" required
                v-on:change="this.resetSelection(); this.fetchBalances(internal.from); this.internal.tokenId = '';">
          <option disabled value="">-- source account --</option>
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
            {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
          </option>
        </select>
        <!-- acc balance preview -->
        <div v-if="internal.from && selectedAsset" class="mt-1 balance">
          <span class="text-info small label">Balance:</span> <span class="value">{{ formatAmount(this.selectedAsset.amount) }} {{this.selectedAsset.symbol}}</span>
        </div>
      </div>

      <!-- Token Selection -->
      <div class="mb-3">
        <label class="form-label">Select Asset</label>
        <select
            v-model="internal.tokenId"
            class="form-select bg-dark border-info" required
            v-on:change="showBalance(internal.tokenId)"
        >
          <option disabled value="">-- select asset --</option>
          <option
              v-for="token in this.accountBalances"
              :key="token.id"
              :value="token.id"
          >
            {{ token.name }} ({{ token.symbol }})
          </option>
        </select>
        <!-- token details preview -->
        <div v-if="selectedTokenInfo?.counterparty" class="token-info-box mt-3">
          <div><span class="label">Address:</span> <span class="value">{{ selectedTokenInfo.address }}</span></div>
          <div><span class="label">Issuer Counterparty:</span> <span class="value">{{ selectedTokenInfo.counterparty?.name || '—' }}</span></div>
        </div>
      </div>

      <!-- Target Account -->
      <div class="mb-3">
        <label class="form-label">To Account</label>
        <select v-model="internal.to"
                class="form-select bg-dark border-info"
                required>
          <option disabled value="">-- target account --</option>
          <option v-for="acc in availableTargetAccounts" :key="acc.id + '-to'" :value="acc.id">
            {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
          </option>
        </select>
      </div>

      <!-- Amount -->
      <div class="mb-3">
        <label class="form-label">Amount</label>
        <input
            v-model="internal.amount"
            type="number"
            step="0.000000000000000001"
            class="form-control bg-dark border-info no-spinner text-white"
            placeholder="Amount to send"
            @input="validateAmount"
        />
        <div v-if="errors.amount" class="form-text text-danger">{{ errors.amount }}</div>
        <div v-if="internal.amount && parseFloat(internal.amount) > parseFloat(selectedAsset?.amount)"
             class="form-text text-warning">Amount exceeds account balance!
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
        <select v-model="transfer.accountId" class="form-select bg-dark border-info" required
                v-on:change="this.resetSelection(); this.fetchBalances(transfer.accountId); this.transfer.tokenId = '';">
          <option disabled value="">-- choose account --</option>
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
            {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
          </option>
        </select>
        <!-- acc balance preview -->
        <div v-if="transfer.accountId && selectedAsset" class="mt-1 balance">
          <span class="text-info small label">Balance:</span> <span class="value">{{ formatAmount(this.selectedAsset.amount) }} {{this.selectedAsset.symbol}}</span>
        </div>
      </div>

      <!-- Token Selection -->
      <div class="mb-3">
        <label class="form-label">Select Asset</label>
        <select
            v-model="transfer.tokenId"
            class="form-select bg-dark border-info" required
            v-on:change="showBalance(transfer.tokenId)"
        >
          <option disabled value="">-- select asset --</option>
          <option
              v-for="token in this.accountBalances"
              :key="token.id"
              :value="token.id"
          >
            {{ token.name }} ({{ token.symbol }})
          </option>
        </select>
        <!-- token details preview -->
        <div v-if="selectedTokenInfo?.counterparty" class="token-info-box mt-3">
          <div><span class="label">Address:</span> <span class="value">{{ selectedTokenInfo.address }}</span></div>
          <div><span class="label">Issuer Counterparty:</span> <span class="value">{{ selectedTokenInfo.counterparty?.name || '—' }}</span></div>
        </div>
      </div>

      <!-- Target Address -->
      <div class="mb-3">
        <label class="form-label">To Address</label>
        <input
            v-model="transfer.to"
            class="form-control bg-dark border-info text-white"
            placeholder="Recipient hex address 0x..."
            pattern="^0x[a-fA-F0-9]{40}$"
            @input="validateTo"
        />
        <div v-if="errors.to" class="form-text text-danger">{{ errors.to }}</div>
      </div>

      <div class="mb-3">
        <label class="form-label">Amount</label>
        <input
            v-model="transfer.amount"
            type="number"
            step="0.000000000000000001"
            class="form-control bg-dark border-info no-spinner text-white"
            placeholder="Amount to send"
            @input="validateAmount"
        />
        <div v-if="errors.amount" class="form-text text-danger">{{ errors.amount }}</div>
        <div v-if="transfer.amount && parseFloat(transfer.amount) > parseFloat(selectedAsset?.amount)"
             class="form-text text-warning">Amount exceeds account balance!
        </div>
      </div>

      <div class="d-flex justify-content-end">
        <button class="btn btn-outline-primary" :disabled="hasErrors">Send</button>
      </div>
    </form>
  </div>

  <TxToast
      v-if="transferSuccess"
      :txData="transferSuccess"
      @closed="transferSuccess = null; selectedTokenInfo = null"
  />
  <ErrorToast
      v-if="transferError"
      :error="transferError"
      @closed="transferError = null; selectedTokenInfo = null"
  />

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

.token-info-box {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid #00ffff55;
  border-radius: 6px;
  padding: 10px 14px;
}

.balance .label,
.token-info-box .label {
  color: #89ffff;
  font-size: 0.875rem;
  font-weight: 500;
}

.balance .value,
.token-info-box .value {
  color: #ffffff;
  font-size: 0.875rem;
  word-break: break-all;
}

</style>
