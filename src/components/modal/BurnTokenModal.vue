<script>
import {validateAmount} from "../../js/validations.js";
import {formatAmount} from "../../js/utils.js";
import {fetchAssetBalance} from "../../services/api.js";

export default {
  props: {
    accounts: Array,
    tokenId: String
  },
  data() {
    return {
      form: {
        redemptionAccountId: '',
        amount: 0
      },
      accountBalance: null,
      errors: {
        amount: ''
      },
    };
  },
  methods: {
    formatAmount,
    async fetchBalance(accountId) {
      let res = await fetchAssetBalance(accountId, this.tokenId);
      this.accountBalance = await res.json();
    },
    validateAmount() {
      this.errors.amount = validateAmount(this.form.amount)
    },
    hasErrors() {
      return !!this.errors.amount;
    },
    resetErrors() {
      this.errors.amount = '';
    },
    submit() {
      this.resetErrors();
      this.validateAmount();
      if (this.hasErrors()) return;
      // proceed with sending the request using fetch
      this.$emit('submit', {
        tokenId: this.tokenId,
        ...this.form
      });
    }
  },
  emits: ['submit', 'close']
}
</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <form class="modal-content border" @submit.prevent="submit">
        <div class="modal-header">
          <h5 class="modal-title">Burn Token</h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <!-- Redemption Account -->
          <div class="mb-3">
            <label class="form-label">Redemption Account</label>
            <select v-model="form.redemptionAccountId" class="form-select" required
                    v-on:change="this.fetchBalance(form.redemptionAccountId)">
              <option disabled value="">-- select account --</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
              </option>
            </select>
            <!-- acc balance preview -->
            <div v-if="form.redemptionAccountId && accountBalance" class="mt-1 balance">
              <span class="small label">Balance:</span> <span class="value">{{ formatAmount(accountBalance.amount) }} {{ accountBalance.symbol }}</span>
            </div>
          </div>

          <!-- Amount -->
          <div class="mb-3">
            <label class="form-label">Amount</label>
            <input type="number" class="form-control no-spinner"
                   v-model.number="form.amount"
                   inputmode="numeric"
                   pattern="\d*"
                   min="0"
                   step="1"
                   @input="validateAmount"
                   required/>
          </div>
          <div v-if="this.errors.amount" class="form-text text-danger">{{ this.errors.amount }}</div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline-secondary btn-sm px-4" @click="$emit('close')">Cancel</button>
          <button class="btn btn-outline-danger btn-sm px-4" type="submit">Burn</button>
        </div>
      </form>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<style scoped>

</style>