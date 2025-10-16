<script>
import {fetchAccounts, fetchAssetBalances} from '../services/accounts-api.js';
import {fetchTokens} from '../services/tokens-api.js';
import {
  sendInternalTransfer,
  sendExternalWithdrawal,
  sendCrossCounterparty
} from '../services/transfers-api.js'
import {fetchAcceptedPartnerships} from "../services/partnership-api.js";
import {formatAmount} from "../js/utils.js";
import TxToast from "../components/toast/SuccessToast.vue";
import ErrorToast from "../components/toast/ErrorToast.vue";
import AccountSelector from "../components/transfer/AccountSelector.vue";
import AmountInput from "../components/transfer/AmountInput.vue";
import {useNetworkStore} from "../js/stores/networkStore.js";
import Pending from "./invoices/Pending.vue";
import {useCounterpartyStore} from "../js/stores/counterpartyStore.js";

export default {
  components: {
    Pending,
    AmountInput,
    AccountSelector,
    TxToast,
    ErrorToast
  },
  data() {
    return {
      selectedForm: "internal",
      accounts: [],
      partnerships: [],
      internal: {
        fromAccountId: "",
        assetId: "",
        toAccountId: "",
        amount: null
      },
      transfer: {
        fromAccountId: "",
        assetId: "",
        toAddress: "",
        amount: null
      },
      crossCp: {
        fromAccountId: "",
        toCounterpartyId: "",
        assetId: "",
        toAccountId: "",
        amount: null
      },
      tokens: [],
      errors: {
        to: "",
        amount: ""
      },
      transferSuccess: null,
      transferError: null,
      assetBalances: [],
      selectedAsset: null,
      selectedTokenInfo: null,
      selectedPartnership: {}
    };
  },
  computed: {
    availableTargetAccounts() {
      if (!this.internal.fromAccountId) return this.accounts;
      return this.accounts.filter(acc => acc.id !== this.internal.fromAccountId);
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
      let res = await fetchAssetBalances(accountId);
      this.assetBalances = await res.json();
    },
    async fetchAcceptedPartnerships() {
      let networkId = useNetworkStore().selectedNetwork.id;
      const loggedInCounterpartyId = useCounterpartyStore().counterparty.id;
      const res = await fetchAcceptedPartnerships(networkId, loggedInCounterpartyId);
      this.partnerships = res.filter(p => {
        return this.hasCrossUsedTokens(p);
      });
    },
    hasCrossUsedTokens(partnership) {
      return partnership.partneredAssets?.length > 0;
    },
    showBalance(assetId) {
      this.selectedAsset = this.assetBalances
          .find(b => b.asset.id === assetId)
      this.selectedToken(assetId)
    },
    selectedToken(assetId) {
      this.selectedTokenInfo = this.tokens
          .find(t => t.id === assetId);
    },
    validateToAddress() {
      const hexRegex = /^0x[a-fA-F0-9]{6,}$/;
      if (!this.transfer.toAddress) {
        this.errors.to = 'Address is required';
      } else if (this.transfer.toAddress.length !== 42) {
        this.errors.to = 'Hex string has invalid length';
      } else if (!hexRegex.test(this.transfer.toAddress)) {
        this.errors.to = 'Must be a valid hex string (e.g., 0x123abc...)';
      } else {
        this.errors.to = '';
      }
    },
    validateAmount() {
      let amount;
      if (this.selectedForm === "internal") {
        amount = this.internal.amount;
      } else if (this.selectedForm === "external") {
        amount = this.transfer.amount;
      } else if (this.selectedForm === "cross_counterparty") {
        amount = this.crossCp.amount;
      }
      let amountStr = amount?.toString();
      if (!amountStr || parseFloat(amountStr) <= 0) {
        this.errors.amount = "Amount must be greater than zero";
        return;
      }
      const balance = parseFloat(this.selectedAsset?.amount);
      if (amount > balance) {
        this.errors.amount = "Amount exceeds account balance!";
        return;
      }
      const decimalPart = amountStr.split(".")[1];
      if (decimalPart && decimalPart.length > 18) {
        this.errors.amount = "Amount must have at most 18 decimal places";
      } else {
        this.errors.amount = "";
      }
    },
    async submitExternalWithdrawal() {
      this.resetError();
      this.validateToAddress();
      this.validateAmount();
      if (this.hasErrors) {
        return;
      }
      try {
        const response = await sendExternalWithdrawal(this.transfer)
        if (!response.ok) {
          const err = await response.json();
          this.handleTransferError(err);
        } else {
          await this.handleSuccess(response);
          // reset form
          this.resetSelection();
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    async submitInternalTransfer() {
      this.resetError();
      this.validateAmount();
      if (this.hasErrors) {
        return;
      }
      try {
        const response = await sendInternalTransfer(this.internal);
        if (!response.ok) {
          const err = await response.json();
          this.handleTransferError(err);
        } else {
          await this.handleSuccess(response);
          // reset form
          this.resetSelection();
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    async submitCrossCounterparty() {
      this.resetError();
      this.validateAmount();
      if (this.hasErrors) {
        return;
      }
      try {
        const response = await sendCrossCounterparty(this.crossCp)
        if (!response.ok) {
          const err = await response.json();
          this.handleTransferError(err);
        } else {
          await this.handleSuccess(response);
          // reset form
          this.resetSelection();
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    resetSelection() {
      this.selectedTokenInfo = null;
      this.selectedAsset = null;
      this.assetBalances = [];
      this.internal = {from: "", assetId: "", to: "", amount: null}
      this.transfer = {fromAccountId: "", assetId: "", to: "", amount: null}
      this.crossCp = {fromAccountId: "", assetId: "", toCounterpartyId: "", amount: null, toAccountId: ""}
    },
    resetError() {
      this.transferSuccess = null;
      this.transferError = null;
      this.errors.to = "";
      this.errors.amount = "";
    },
    async handleSuccess(response) {
      let data = await response.json();
      let message = `${data.asset.amount} ${data.asset.name} (${data.asset.symbol}) has been transferred`
      this.transferSuccess = {transferId: data.id, message};
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
  <h3 class="bold p-2 pt-3">Asset Transfer</h3>

  <div class="d-flex justify-content-around p-3">
    <div class="type-selector">
      <div class="form-check form-check-inline">
        <input class="form-check-input border-primary" type="radio" id="internalRadio" value="internal"
               v-on:change="this.resetSelection(); this.resetError();"
               v-model="selectedForm"/>
        <label class="form-check-label fw-bold" for="internalRadio">Internal Transfer</label>
      </div>
      <div class="form-check form-check-inline me-3">
        <input class="form-check-input border-primary" type="radio" id="externalRadio" value="external"
               v-on:change="this.resetSelection(); this.resetError();"
               v-model="selectedForm"/>
        <label class="form-check-label fw-bold" for="externalRadio">External Withdrawal</label>
      </div>
      <div class="form-check form-check-inline me-3">
        <input class="form-check-input border-primary" type="radio" id="cpRadio" value="cross_counterparty"
               v-on:change="this.resetSelection(); this.resetError(); this.fetchAcceptedPartnerships()"
               v-model="selectedForm"/>
        <label class="form-check-label fw-bold" for="cpRadio">Cross Counterparty</label>
      </div>
      <div class="form-check form-check-inline me-3">
        <input class="form-check-input border-primary" type="radio" id="invoicesRadio" value="invoices"
               v-model="selectedForm"/>
        <label class="form-check-label fw-bold" for="invoicesRadio">Invoices</label>
      </div>
    </div>
  </div>

  <div v-if="selectedForm === 'internal'" class="d-flex justify-content-center mt-5">
    <form @submit.prevent="submitInternalTransfer" class="transfer-form card p-3 border rounded">
      <h3 class="mb-4 text-center">Transfer between Accounts</h3>

      <!-- Source Account -->
      <AccountSelector
          v-model="internal.fromAccountId"
          :accounts="accounts.filter((item) => item.type === 'ADMIN' || item.type === 'CLIENT' || item.type === 'DISTRIBUTOR')"
          :balance="selectedAsset"
          @change="val => { fetchBalances(val); internal.assetId = '' }"
      />

      <!-- Asset Selection -->
      <div class="mb-3">
        <label class="form-label">Select Asset</label>
        <select
            v-model="internal.assetId"
            class="form-select" required
            v-on:change="showBalance(internal.assetId)"
        >
          <option disabled value="">-- select asset --</option>
          <option
              v-for="balance in this.assetBalances"
              :key="balance.asset.id"
              :value="balance.asset.id"
          >
            {{ balance.asset.name }} ({{ balance.asset.symbol }})
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
        <select v-model="internal.toAccountId"
                class="form-select"
                required>
          <option disabled value="">-- target account --</option>
          <option v-for="acc in availableTargetAccounts.filter((item) => item.type === 'ADMIN' || item.type === 'ISSUER' || item.type === 'CLIENT')" :key="acc.id + '-to'" :value="acc.id">
            {{ acc.name }}
          </option>
        </select>
      </div>

      <AmountInput
          v-model="internal.amount"
          :validate="validateAmount"
          :error-message="errors.amount"
      />

      <div class="d-flex justify-content-end">
        <button class="btn btn-outline-primary btn-sm" :disabled="hasErrors">Send</button>
      </div>
    </form>
  </div>

  <div v-else-if="selectedForm === 'external'" class="d-flex justify-content-center mt-5">
    <form @submit.prevent="submitExternalWithdrawal" class="transfer-form card p-3 border rounded">
      <h3 class="mb-4 text-center">Withdraw to external Address</h3>

      <AccountSelector
          v-model="transfer.fromAccountId"
          :accounts="accounts.filter((item) => item.type === 'ADMIN' || item.type === 'CLIENT')"
          :balance="selectedAsset"
          @change="val => { fetchBalances(val); transfer.assetId = '' }"
      />

      <!-- Token Selection -->
      <div class="mb-3">
        <label class="form-label">Select Asset</label>
        <select
            v-model="transfer.assetId"
            class="form-select" required
            v-on:change="showBalance(transfer.assetId)"
        >
          <option disabled value="">-- select asset --</option>
          <option
              v-for="balance in this.assetBalances"
              :key="balance.asset.id"
              :value="balance.asset.id"
          >
            {{ balance.asset.name }} ({{ balance.asset.symbol }})
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
            v-model="transfer.toAddress"
            class="form-control"
            placeholder="Recipient hex address 0x..."
            pattern="^0x[a-fA-F0-9]{40}$"
            @input="validateToAddress"
        />
        <div v-if="errors.to" class="form-text text-danger">{{ errors.to }}</div>
      </div>

      <AmountInput
          v-model="transfer.amount"
          :validate="validateAmount"
          :error-message="errors.amount"
      />

      <div class="d-flex justify-content-end">
        <button class="btn btn-outline-primary btn-sm" :disabled="hasErrors">Send</button>
      </div>
    </form>
  </div>

  <div v-else-if="selectedForm === 'cross_counterparty'" class="d-flex justify-content-center mt-5">
    <form @submit.prevent="submitCrossCounterparty" class="transfer-form card p-3 border rounded">
      <h3 class="mb-4 text-center">Cross-Counterparty Transfer</h3>

      <AccountSelector
          v-model="crossCp.fromAccountId"
          :accounts="accounts.filter((item) => item.type === 'ADMIN' || item.type === 'CLIENT' || item.type === 'DISTRIBUTOR')"
          :balance="selectedAsset"
          @change="val => { fetchBalances(val); crossCp.assetId = '' }"
      />

      <!-- Partnership Selection -->
      <div class="mb-3">
        <label class="form-label">Select Counterparty</label>

        <select v-if="partnerships"
                v-model="selectedPartnership"
                class="form-select"
                v-on:change="this.crossCp.toCounterpartyId = selectedPartnership.id;"
                required
        >
          <option disabled value="">-- select counterparty --</option>
          <option v-for="counterparty in partnerships" :key="counterparty.id" :value="counterparty">
            {{ counterparty.name }}
          </option>
        </select>
      </div>

      <!-- Target Account -->
      <div class="mb-3" v-if="selectedPartnership.targetAccounts">
        <label class="form-label">To Operational Account</label>
        <select v-model="crossCp.toAccountId"
                class="form-select"
                required>
          <option disabled value="">-- target account --</option>
          <option v-for="acc in selectedPartnership.targetAccounts" :key="acc.id + '-to'" :value="acc.id">
            {{ acc.name }}
          </option>
        </select>
      </div>

      <div class="mb-3" v-if="selectedPartnership.targetAccounts">
        <label class="form-label">Select asset</label>
        <select v-if="selectedPartnership"
                v-model="crossCp.assetId"
                class="form-select" required
                v-on:change="showBalance(crossCp.assetId)"
        >
          <option disabled value="">-- select asset --</option>
          <option v-for="asset in selectedPartnership.partneredAssets" :key="asset.id" :value="asset.id">
            {{ asset.name }} ({{ asset.symbol }})
          </option>
        </select>
      </div>

      <AmountInput
          v-model="crossCp.amount"
          :validate="validateAmount"
          :error-message="errors.amount"
      />

      <div class="d-flex justify-content-end">
        <button class="btn btn-outline-primary btn-sm" :disabled="hasErrors">Send</button>
      </div>
    </form>
  </div>

  <div v-if="selectedForm === 'invoices'" class="d-flex justify-content-center mt-5">
    <Pending class="card p-3 border rounded"></Pending>
  </div>

  <TxToast
      v-if="transferSuccess"
      :success="transferSuccess"
      @closed="transferSuccess = null; selectedTokenInfo = null"
  />
  <ErrorToast
      v-if="transferError"
      :error="transferError"
      @closed="transferError = null; selectedTokenInfo = null"
  />

</template>

<style>
.transfer-form {
  width: 100%;
  max-width: 500px;
}

.token-info-box {
  background: var(--color-bg-body);
  border: 1px solid var(--color-border);
  border-radius: 6px;
  padding: 10px 14px;
}

.balance .label,
.token-info-box .label {
  font-size: 0.875rem;
  font-weight: 500;
}

.balance .value,
.token-info-box .value {
  font-size: 0.875rem;
  word-break: break-all;
}

</style>
