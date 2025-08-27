<script>
import {fetchAccounts, fetchAssetBalances} from "../../services/api.js";
import {fetchInvoice, cancelInvoice, executeInvoice, rejectInvoice} from "../../services/invoices-api.js";
import AccountSelector from "../../components/transfer/AccountSelector.vue";
import {formatDate} from "../../js/utils.js";

export default {
  name: "PayInvoice",
  components: {AccountSelector},
  props: ['invoiceId'],
  data() {
    return {
      invoice: {
        payerCounterparty: {},
        receiverCounterparty: {},
        receiverAccount: {},
        asset: {},
        amount: null,
        isPayer: false
      },
      accounts: [],
      form: {
        accountFrom: ""
      },
      selectedAsset: null,
      success: null
    }
  },
  mounted() {
    this.getInvoice();
    this.fetchAccounts();
  },
  methods: {
    formatDate,
    goBack() {
      this.$router.push('/transfer');
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
    cancel() {
      cancelInvoice(this.invoiceId)
          .then(() => {
            console.log("Cancelling invoice", {
              invoiceId: this.invoiceId,
              accountFrom: this.form.accountFrom
            })
            this.success = true;
          })
      //this.$router.push("/transfers")
    },
    reject() {
      rejectInvoice(this.invoiceId)
          .then(() => {
            console.log("Rejecting invoice", {
              invoiceId: this.invoiceId,
              accountFrom: this.form.accountFrom
            })
            this.success = true;
          })
      //this.$router.push("/transfers")
    },
    execute() {
      executeInvoice(this.invoiceId, this.form.accountFrom)
          .then(() => {
            console.log("Approving invoice", {
              invoiceId: this.invoiceId,
              accountFrom: this.form.accountFrom
            })
            this.success = true;
          })
      // this.$router.push("/transfers")
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
            <h4 class="card-title text-center mb-4">{{ invoice.isPayer ? 'Approve Invoice' : 'Invoice' }}</h4>
            <!-- requested date -->
            <p class="text-muted text-center small mb-4">
              Requested: {{ formatDate(invoice.requestedAt) }}
            </p>
            <!-- status badge -->
            <p class="text-center m-3"
               :class="{
              'text-success': (invoice.status === 'CREATED' || invoice.status === 'APPROVED'),
              'text-danger': invoice.status === 'REJECTED',
              'text-warning': invoice.status === 'CANCELLED'
            }">
              {{ invoice.status }}
            </p>

            <!-- sender account selection -->
            <AccountSelector v-if="invoice.isPayer && invoice.status === 'CREATED'"
                             v-model="form.accountFrom"
                             :accounts="accounts"
                             :selected-asset="selectedAsset"
                             @change="val => { showBalance(val, invoice.asset.id) }"
                             :label="'Select Your Account'"
            />

            <div v-if="invoice.isPayer" class="mb-3">
              <label class="form-label">Receiver Counterparty</label>
              <input type="text" class="form-control" :value="invoice.receiverCounterparty?.name" readonly>
            </div>

            <div v-if="!invoice.isPayer" class="mb-3">
              <label class="form-label">Payer Counterparty</label>
              <input type="text" class="form-control" :value="invoice.payerCounterparty?.name" readonly>
            </div>

            <!-- Receiving Account -->
            <div v-if="!invoice.isPayer" class="mb-3">
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
              <div v-if="invoice.isPayer" class="d-flex justify-content-end gap-2">
                <button class="btn btn-sm btn-outline-danger" @click="reject" :disabled="success">Reject</button>
                <button class="btn btn-sm btn-primary"
                        :disabled="!form.accountFrom || invoice.amount > selectedAsset?.amount || success"
                        @click="execute">
                  Execute
                </button>
              </div>
              <div v-if="!invoice.isPayer" class="d-flex justify-content-end">
                <button class="btn btn-sm btn-outline-danger" @click="cancel" :disabled="success">Cancel</button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>

</template>
