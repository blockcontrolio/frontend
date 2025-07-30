<script>
import {
  fetchAccounts,
  fetchAssetBalances,
  fetchTokens,
  sendInternalTransfer,
  sendExternalWithdrawal,
  sendCrossCounterparty
} from '../services/api'
import {formatAmount} from "../js/utils.js";
import TxToast from "../components/toast/TxToast.vue";
import ErrorToast from "../components/toast/ErrorToast.vue";
import FromAccountSelector from "../components/transfer/FromAccountSelector.vue";
import AmountInput from "../components/transfer/AmountInput.vue";
import {fetchPartnerships} from "../services/partnership.js";
import {useNetworkStore} from "../js/stores/networkStore.js";

export default {
  components: {
    AmountInput,
    FromAccountSelector,
    TxToast,
    ErrorToast
  },
  data() {
    return {
      selectedForm: "internal", // or 'internal'
      accounts: [], // should be populated externally
      partnerships: [],
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
      crossCp: {
        fromAccountId: "",
        toCounterpartyId: "",
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
      selectedTokenInfo: null,
      selectedPartnership: {},
      availableTokensCp: []
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
      let res = await fetchAssetBalances(accountId);
      this.accountBalances = await res.json();
    },
    async fetchAcceptedPartnerships() {
      let selectedNetwork = useNetworkStore().selectedNetwork;
      let networkId = selectedNetwork?.id;
      if ([networkId].some(value => value === undefined || value === null || value === '')) {
        throw new Error('Network Id undefined or empty.');
      }
      const res = await fetchPartnerships(networkId);
      const partnershipsRaw = await res.json();
      this.partnerships = partnershipsRaw.filter(p => {
        return p.status === 'ACCEPTED' && this.hasCrossUsedTokens(p);
      });
    },
    hasCrossUsedTokens(partnership) {
      return partnership.crossUsedTokens?.length > 0;
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
    validateToAddress() {
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
      if (this.hasErrors) return; // proceed with sending the transfer request using fetch
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
      if (this.hasErrors) return; // proceed with sending the transfer request using fetch
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
      if (this.hasErrors) return; // proceed with sending the transfer request using fetch
      try {
        this.crossCp.toCounterpartyId = this.selectedPartnership.targetCounterpartyId;
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
      this.accountBalances = [];
      this.internal = {from: "", tokenId: "", to: "", amount: null}
      this.transfer = {accountId: "", tokenId: "", to: "", amount: null}
      this.crossCp = {fromAccountId: "", tokenId: "", toCounterpartyId: "", amount: null, to: ""}
    },
    resetError() {
      this.transferSuccess = null;
      this.transferError = null;
      this.errors.to = "";
      this.errors.amount = "";
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
        <label class="form-check-label fw-bold" for="cpRadio">Cross Partnership</label>
      </div>
    </div>
  </div>

  <div v-if="selectedForm === 'internal'" class="d-flex justify-content-center mt-5">
    <form @submit.prevent="submitInternalTransfer" class="transfer-form card p-3 border rounded">
      <h3 class="mb-4 text-center">Transfer between Accounts</h3>

      <!-- Source Account -->
      <FromAccountSelector
          v-model="internal.from"
          :accounts="accounts"
          :selected-asset="selectedAsset"
          @change="val => { fetchBalances(val); internal.tokenId = '' }"
      />

      <!-- Token Selection -->
      <div class="mb-3">
        <label class="form-label">Select Asset</label>
        <select
            v-model="internal.tokenId"
            class="form-select" required
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
                class="form-select"
                required>
          <option disabled value="">-- target account --</option>
          <option v-for="acc in availableTargetAccounts" :key="acc.id + '-to'" :value="acc.id">
            {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
          </option>
        </select>
      </div>

      <AmountInput
          v-model="internal.amount"
          :selected-asset="selectedAsset"
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

      <FromAccountSelector
          v-model="transfer.accountId"
          :accounts="accounts"
          :selected-asset="selectedAsset"
          @change="val => { fetchBalances(val); transfer.tokenId = '' }"
      />

      <!-- Token Selection -->
      <div class="mb-3">
        <label class="form-label">Select Asset</label>
        <select
            v-model="transfer.tokenId"
            class="form-select" required
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
            class="form-control"
            placeholder="Recipient hex address 0x..."
            pattern="^0x[a-fA-F0-9]{40}$"
            @input="validateToAddress"
        />
        <div v-if="errors.to" class="form-text text-danger">{{ errors.to }}</div>
      </div>

      <AmountInput
          v-model="transfer.amount"
          :selected-asset="selectedAsset"
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

      <FromAccountSelector
          v-model="crossCp.fromAccountId"
          :accounts="accounts"
          :selected-asset="selectedAsset"
          @change="val => { fetchBalances(val); crossCp.tokenId = '' }"
      />

      <!-- Partnership Selection -->
      <div class="mb-3">
        <label class="form-label">Select Counterparty</label>

        <select v-if="partnerships"
                v-model="selectedPartnership"
                class="form-select" required
        >
          <option disabled value="">-- select counterparty --</option>
          <option v-for="cp in partnerships" :key="cp.relationId" :value="cp">
            {{ cp.counterpartyName }}
          </option>
        </select>
      </div>

      <!-- Target Account -->
      <div class="mb-3" v-if="selectedPartnership.targetAccounts">
        <label class="form-label">To Operational Account</label>
        <select v-model="crossCp.to"
                class="form-select"
                required>
          <option disabled value="">-- target account --</option>
          <option v-for="acc in selectedPartnership.targetAccounts" :key="acc.id + '-to'" :value="acc.id">
            {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
          </option>
        </select>
      </div>

      <div class="mb-3" v-if="selectedPartnership.targetAccounts">
        <label class="form-label">Select cross-used token</label>
        <select v-if="selectedPartnership"
                v-model="crossCp.tokenId"
                class="form-select" required
                v-on:change="showBalance(crossCp.tokenId)"
        >
          <option disabled value="">-- select token --</option>
          <option v-for="token in selectedPartnership.crossUsedTokens" :key="token.id" :value="token.id">
            {{ token.name }} ({{ token.symbol }})
          </option>
        </select>
      </div>

      <AmountInput
          v-model="crossCp.amount"
          :selected-asset="selectedAsset"
          :validate="validateAmount"
          :error-message="errors.amount"
      />

      <div class="d-flex justify-content-end">
        <button class="btn btn-outline-primary btn-sm" :disabled="hasErrors">Send</button>
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
