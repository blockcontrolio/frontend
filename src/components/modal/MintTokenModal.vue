<script>
import {validateAmount} from "../../js/validations.js";

export default {
  props: {
    accounts: Array,
    tokenId: String
  },
  data() {
    return {
      form: {
        issuerAccountId: '',
        recipientAccountId: '',
        amount: 0
      },
      errors: {
        amount: ''
      },
    };
  },
  methods: {
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
  }
}
</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white border border-info">
        <div class="modal-header">
          <h5 class="modal-title">Mint Token</h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <!-- Issuer Account -->
          <div class="mb-3">
            <label class="form-label">Issuer Account</label>
            <select v-model="form.issuerAccountId" class="form-select bg-dark border-info" required>
              <option disabled value="">-- select issuer --</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
              </option>
            </select>
          </div>
          <!-- Recipient Account -->
          <div class="mb-3">
            <label class="form-label">Recipient Account</label>
            <select v-model="form.recipientAccountId" class="form-select bg-dark border-info" required>
              <option disabled value="">-- select recipient --</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
              </option>
            </select>
          </div>
          <!-- Amount -->
          <div class="mb-3">
            <label class="form-label">Amount</label>
            <input type="number" class="form-control bg-dark border-info no-spinner text-white"
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
          <button class="btn btn-outline-secondary px-4" @click="$emit('close')">Cancel</button>
          <button class="btn btn-outline-primary px-4" @click="submit">Mint</button>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<style scoped>
input::placeholder,
select {
  color: #ccc;
}
</style>