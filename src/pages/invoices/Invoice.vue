<script>
import {fetchAccounts, fetchAssetBalances} from "../../services/api.js";
import {fetchInvoice} from "../../services/invoices-api.js";
import AccountSelector from "../../components/transfer/AccountSelector.vue";

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
      selectedAsset: null
    }
  },
  mounted() {
    this.getInvoice();
    this.fetchAccounts();
  },
  methods: {
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
      this.$router.push("/transfers")
    },
    approveInvoice() {
      console.log("Approving invoice", {
        invoiceId: this.invoiceId,
        accountFrom: this.form.accountFrom
      })
      this.$router.push("/transfers")
    }
  }
}
</script>

<template>
  <h5 class="bold p-2">Invoice details: {{ this.invoiceId }}</h5>

  <div class="container py-3">

    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">

        <div class="card rounded border-0">
          <div class="card-body p-4">
            <h4 v-if="invoice.isPayer" class="card-title text-center mb-4">Approve Invoice</h4>
            <h4 v-else class="card-title text-center mb-4">Invoice</h4>

            <!-- Sender account selection -->
            <AccountSelector v-if="invoice.isPayer"
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
            <div v-if="invoice.isPayer" class="d-flex justify-content-end gap-2">
              <button class="btn btn-sm btn-outline-danger" @click="cancel">Reject</button>
              <button class="btn btn-sm btn-primary"
                      :disabled="!form.accountFrom || invoice.amount > selectedAsset?.amount" @click="approveInvoice">
                Execute
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>

</template>
