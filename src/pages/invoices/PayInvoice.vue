<script>
import {fetchAccounts, fetchAssetBalances, fetchTokens} from "../../services/api.js";
import {fetchInvoice} from "../../services/invoices-api.js";
import FromAccountSelector from "../../components/transfer/FromAccountSelector.vue";

export default {
  name: "InvoiceApproval",
  components: {FromAccountSelector},
  props: ['requestId'],
  data() {
    return {
      invoice: {
        toCounterparty: {},
        asset: {},
        receivingAccount: {},
        amount: null
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
      const res = await fetchInvoice(this.requestId)
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
        requestId: this.requestId,
        accountFrom: this.form.accountFrom
      })
      this.$router.push("/transfers")
    }
  }
}
</script>

<template>
  <div class="container py-5">
    <div class="row justify-content-center">
      <div class="col-md-8 col-lg-6">

        <div class="card rounded border-0">
          <div class="card-body p-4">
            <h4 class="card-title text-center mb-4">Approve Invoice</h4>

            <!-- invoice details -->
            <div class="mb-3">
              <label class="form-label">Invoice ID</label>
              <input type="text" class="form-control" :value="this.requestId" readonly>
            </div>

            <!-- Sender account selection -->
            <FromAccountSelector
                v-model="form.accountFrom"
                :accounts="accounts"
                :selected-asset="selectedAsset"
                @change="val => { showBalance(val, invoice.asset.id) }"
                :label="'Select Your Account'"
            />

            <div class="mb-3">
              <label class="form-label">Amount</label>
              <input type="text" class="form-control"
                     :value="`${invoice.amount} ${invoice.asset?.name} (${invoice.asset?.symbol})`"
                     readonly>
            </div>

            <div class="mb-3">
              <label class="form-label">Recipient Counterparty</label>
              <input type="text" class="form-control" :value="invoice.toCounterparty?.name" readonly>
            </div>

            <!-- action buttons -->
            <div class="d-flex justify-content-between">
              <button class="btn btn-sm btn-outline-secondary" @click="cancel">Cancel</button>
              <button class="btn btn-sm btn-primary"
                      :disabled="!form.accountFrom || invoice.amount > selectedAsset?.amount" @click="approveInvoice">
                Approve & Send
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  </div>

</template>
