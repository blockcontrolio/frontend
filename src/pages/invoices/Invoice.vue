<script>
import {fetchAccounts, fetchAssetBalances} from "../../services/accounts-api.js";
import {fetchInvoice, cancelInvoice, executeInvoice, rejectInvoice} from "../../services/invoices-api.js";
import AccountSelector from "../../components/transfer/AccountSelector.vue";
import {formatDate} from "../../js/utils.js";
import ErrorToast from "../../components/toast/ErrorToast.vue";
import TxToast from "../../components/toast/SuccessToast.vue";
import InfoToast from "../../components/toast/InfoToast.vue";
import {useCounterpartyStore} from "../../js/stores/counterpartyStore.js";

export default {
  name: "PayInvoice",
  components: {InfoToast, TxToast, ErrorToast, AccountSelector},
  props: ['invoiceId'],
  data() {
    return {
      invoice: {
        payerCounterparty: {},
        receiverCounterparty: {},
        receiverAccount: {},
        asset: {},
        amount: null,
        status: ''
      },
      accounts: [],
      accountFrom: "",
      selectedAsset: null,
      disableButtons: null,
      transferSuccess: null,
      transferError: null,
      messageSuccess: ''
    }
  },
  mounted() {
    this.getInvoice();
    this.fetchAccounts();
  },
  methods: {
    formatDate,
    isPayer(invoice) {
      return useCounterpartyStore().counterparty.id === invoice.payerCounterparty.id
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push('/');
      }
    },
    async getInvoice() {
      const res = await fetchInvoice(this.invoiceId)
      this.invoice = await res.json();
    },
    async fetchAccounts() {
      let res = await fetchAccounts();
      this.accounts = await res.json();
    },
    async showBalance(accountId, assetId) {
      const balances = await this.fetchBalances(accountId);
      this.selectedAsset = balances
          .find(b => b.id === assetId)
      console.log("Selected asset: ", this.selectedAsset?.symbol)
    },
    async fetchBalances(accountId) {
      let res = await fetchAssetBalances(accountId);
      return await res.json();
    },
    async cancel() {
      this.disableButtons = true;
      try {
        const response = await cancelInvoice(this.invoiceId)
        if (!response.ok) {
          const err = await response.json();
          this.handleError(err);
        } else {
          this.messageSuccess = 'You have cancelled invoice';
          this.invoice.status = 'CANCELLED';
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    async reject() {
      this.disableButtons = true;
      try {
        const response = await rejectInvoice(this.invoiceId)
        if (!response.ok) {
          const err = await response.json();
          this.handleError(err);
        } else {
          this.messageSuccess = 'You have rejected invoice';
          this.invoice.status = 'REJECTED';
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    async execute() {
      this.disableButtons = true;
      try {
        const response = await executeInvoice(this.invoiceId, this.accountFrom)
        if (!response.ok) {
          const err = await response.json();
          this.handleError(err);
        } else {
          await this.handleSuccess(response);
          this.invoice.status = 'EXECUTED';
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    async handleSuccess(response) {
      let transferData = await response.json();
      let message = `${transferData.asset.amount} ${transferData.asset.name} (${transferData.asset.symbol}) has been transferred`
      this.transferSuccess = {hash: transferData.transactionHash, message};
    },
    handleError(err) {
      this.transferError = {
        error: err.error || 'Error',
        message: err.message || 'Unknown error occurred.'
      };
    },
    handleUnknownError(err) {
      console.error(err)
      this.transferError = {
        error: 'Network Error',
        message: err.message
      };
    }
  }
}
</script>

<template>
  <h5 class="bold p-2">Invoice details: {{ this.invoiceId }}</h5>

  <div class="container py-3">

    <button
        class="btn btn-dark btn-sm my-3"
        @click="goBack"
    >
      Return
    </button>

    <div class="row justify-content-center mt-3">
      <div class="col-md-8 col-lg-6">

        <div class="card rounded border-0">
          <div class="card-body p-4">
            <h4 class="card-title text-center mb-4">
              {{ isPayer(invoice) && invoice.status === 'CREATED' ? 'Execute Invoice' : 'Invoice' }}</h4>
            <!-- requested date -->
            <p class="text-muted text-center small mb-4">
              Request Time: {{ formatDate(invoice.requestedAt) }}
            </p>
            <!-- status badge -->
            <p class="text-center m-3"
               :class="{
              'text-success': (invoice.status === 'CREATED' || invoice.status === 'EXECUTED'),
              'text-danger': invoice.status === 'REJECTED',
              'text-warning': invoice.status === 'CANCELLED'
            }">
              {{ invoice.status }}
            </p>

            <!-- sender account selection -->
            <AccountSelector v-if="isPayer(invoice) && invoice.status === 'CREATED'"
                             v-model="accountFrom"
                             :accounts="accounts"
                             :selected-asset="selectedAsset"
                             @change="val => { showBalance(val, invoice.asset.id) }"
                             :label="'Select Your Account'"
            />

            <div v-if="isPayer(invoice)" class="mb-3">
              <label class="form-label">Receiver Counterparty</label>
              <input type="text" class="form-control" :value="invoice.receiverCounterparty?.name" readonly>
            </div>

            <div v-if="!isPayer(invoice)" class="mb-3">
              <label class="form-label">Payer Counterparty</label>
              <input type="text" class="form-control" :value="invoice.payerCounterparty?.name" readonly>
            </div>

            <!-- Receiving Account -->
            <div v-if="!isPayer(invoice)" class="mb-3">
              <label class="form-label">To Receiving Account</label>
              <input type="text" class="form-control"
                     :value="`${invoice.receiverAccount?.name || 'Unnamed'}`"
                     readonly>
            </div>

            <div class="mb-3">
              <label class="form-label">Amount</label>
              <input type="text" class="form-control"
                     :value="`${invoice.amount} ${invoice.asset?.name} (${invoice.asset?.symbol})`"
                     readonly>
            </div>

            <!-- action buttons -->
            <div v-if="invoice.status === 'CREATED'">
              <div v-if="isPayer(invoice)" class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-danger" @click="reject" :disabled="disableButtons">Reject</button>
                <button class="btn btn-sm btn-primary"
                        :disabled="!accountFrom || invoice.amount > selectedAsset?.amount || disableButtons"
                        @click="execute">
                  Execute
                </button>
              </div>
              <div v-if="!isPayer(invoice)" class="d-flex justify-content-end">
                <button class="btn btn-sm btn-outline-danger" @click="cancel" :disabled="disableButtons">Cancel</button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>

  <TxToast
      v-if="transferSuccess"
      :success="transferSuccess"
      @closed="transferSuccess = null;"
  />
  <ErrorToast
      v-if="transferError"
      :error="transferError"
      @closed="transferError = null;"
  />
  <InfoToast
      v-if="messageSuccess"
      :message="messageSuccess"
      @closed="messageSuccess = null;"
  />

</template>
