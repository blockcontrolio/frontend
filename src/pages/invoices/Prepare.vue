<script>
import {fetchAccounts, fetchAssetBalances, fetchTokens} from '../../services/api.js'
import {prepareCrossCounterpartyInvoice} from '../../services/invoices-api.js'
import InfoToast from "../../components/toast/InfoToast.vue";
import ErrorToast from "../../components/toast/ErrorToast.vue";
import AmountInput from "../../components/transfer/AmountInput.vue";
import {fetchPartnerships} from "../../services/partnership.js";
import {useNetworkStore} from "../../js/stores/networkStore.js";
import AccountSelector from "../../components/transfer/AccountSelector.vue";
import {copyToClipboard, isClipboardSupported} from "../../js/clipboard.js";

export default {
  components: {
    AccountSelector,
    AmountInput,
    InfoToast,
    ErrorToast
  },
  data() {
    return {
      accounts: [],
      partnerships: [],
      invoice: {
        payerCounterpartyId: "",
        receiverAccountId: "",
        assetId: "",
        amount: null
      },
      tokens: [],
      errors: {
        to: "",
        amount: ""
      },
      selectedAsset: null,
      messageSuccess: '',
      messageError: null,
      selectedTokenInfo: null,
      selectedPartnership: {},
      transfer: {}
    };
  },
  computed: {
    receivingAccounts() {
      return this.accounts.filter(acc => acc.type === 'DISTRIBUTOR')
    },
    hasErrors() {
      return !!this.errors.to || !!this.errors.amount;
    },
    fullLink() {
      return `${window.location.origin}/invoices/${this.transfer.invoiceId}`;
    }
  },
  mounted() {
    this.fetchAcceptedPartnerships();
    this.fetchTokens();
    this.fetchAccounts();
  },
  methods: {
    isClipboardSupported,
    async fetchTokens() {
      const res = await fetchTokens()
      this.tokens = await res.json();
    },
    async fetchAccounts() {
      let res = await fetchAccounts();
      this.accounts = await res.json();
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
    async fetchBalances(accountId) {
      let res = await fetchAssetBalances(accountId);
      this.accountBalances = await res.json();
    },
    hasCrossUsedTokens(partnership) {
      return partnership.partneredAssets?.length > 0;
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
    validateAmount() {
      let amount = this.invoice.amount;
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
    async submitCrossCounterparty() {
      this.resetError();
      this.validateAmount();
      if (this.hasErrors) return; // proceed with sending the transfer request using fetch
      try {
        this.invoice.payerCounterpartyId = this.selectedPartnership.sourceCounterpartyId;
        const response = await prepareCrossCounterpartyInvoice(this.invoice);
        if (!response.ok) {
          const err = await response.json();
          this.handleError(err);
        } else {
          await this.handleSuccess(response);
          this.invoice = {
            payerCounterpartyId: "",
            receiverAccountId: "",
            assetId: "",
            amount: null
          };
          this.selectedPartnership = {};
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    resetError() {
      this.messageSuccess = '';
      this.messageError = null;
      this.errors.to = "";
      this.errors.amount = "";
    },
    async handleSuccess(response) {
      this.transfer = await response.json();
      this.messageSuccess = `You have prepared invoice to receive ${this.invoice.amount} ${this.selectedAsset?.name} (${this.selectedAsset?.symbol})`;
    },
    handleUnknownError(err) {
      console.error(err)
      this.messageError = {
        error: 'Network Error',
        message: err.message
      };
    },
    handleError(err) {
      this.messageError = {
        error: err.error || 'Error',
        message: err.message || 'Unknown error occurred.'
      };
    },
    async copyLink(link) {
      copyToClipboard(link)
          .then(() => {
            console.log('Link copied!', link);
          });
    },
    obfuscated(fullLink) {
      const index = fullLink.indexOf("invoices");
      return 'invoice';
    }
  }
};
</script>

<template>
  <h3 class="bold p-2 pt-3">Receive Transfer</h3>

  <div v-if="transfer.invoiceId" class="d-flex justify-content-center pt-4">
    <div class="text-center gap-2">
      <span>Target counterparty will see this request in their incoming list. Copy and share the link directly:</span><br>
      <a :href="fullLink"
         target="_blank"
         rel="noopener noreferrer"
         class="mono fw-bold link-primary link-opacity-75 me-2 text-decoration-none">
        {{ obfuscated(fullLink) }}
      </a>
      <i v-if="isClipboardSupported()" class="bi bi-clipboard pointer"
         @click="copyLink(fullLink)"
         title="Copy to clipboard">
      </i>
    </div>
  </div>

  <div class="d-flex justify-content-center mt-5">
    <form @submit.prevent="submitCrossCounterparty" class="transfer-form card p-3 border rounded">
      <h3 class="mb-4 text-center">Prepare Cross-Counterparty Invoice</h3>

      <!-- Partnership Selection -->
      <div class="mb-3">
        <label class="form-label">Select Payer Counterparty</label>

        <select v-if="partnerships"
                v-model="selectedPartnership"
                class="form-select" required
        >
          <option disabled value="">-- payer counterparty --</option>
          <option v-for="cp in partnerships" :key="cp.relationId" :value="cp">
            {{ cp.counterpartyName }}
          </option>
        </select>
      </div>

      <!-- Receiving Account -->
      <AccountSelector
          v-model="invoice.receiverAccountId"
          :accounts="receivingAccounts"
          :selected-asset="selectedAsset"
          @change="val => { fetchBalances(val); invoice.assetId = '' }"
          :placeholder="'-- receiving account --'"
          :label="'To Receiving Account'"
      />

      <div class="mb-3">
        <label class="form-label">Select asset</label>
        <select v-if="selectedPartnership"
                v-model="invoice.assetId"
                class="form-select" required
                v-on:change="showBalance(invoice.assetId)"
        >
          <option disabled value="">-- select asset --</option>
          <option v-for="asset in selectedPartnership.partneredAssets" :key="asset.id" :value="asset.id">
            {{ asset.name }} ({{ asset.symbol }})
          </option>
        </select>
      </div>

      <AmountInput
          v-model="invoice.amount"
          :placeholder="'Amount to receive'"
          :selected-asset="selectedAsset"
          :validate="validateAmount"
          :error-message="errors.amount"
      />

      <div class="d-flex justify-content-end">
        <button class="btn btn-outline-primary btn-sm" :disabled="hasErrors">Send</button>
      </div>
    </form>
  </div>

  <InfoToast
      v-if="messageSuccess"
      :message="messageSuccess"
      @closed="messageSuccess = null; selectedTokenInfo = null"
  />
  <ErrorToast
      v-if="messageError"
      :error="messageError"
      @closed="messageError = null; selectedTokenInfo = null"
  />

</template>

<style>
.transfer-form {
  width: 100%;
  max-width: 500px;
}
</style>
