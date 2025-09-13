<script>
import {validateAddress, validateAmount} from "../../js/validations.js";

export default {
  props: {
    accounts: Array,
    token: Object
  },
  data() {
    return {
      form: {
        custodianAccountId: '',
        user: '',
        amount: 0
      },
      errors: {
        user: '',
        amount: ''
      },
    };
  },
  methods: {
    submit() {
      this.resetErrors();
      this.validateUser();
      this.validateAmount();
      if (this.hasErrors()) return;
      // proceed with sending the request using fetch
      this.$emit('submit', {
        tokenId: this.token.id,
        ...this.form
      });
    },
    validateUser() {
      this.errors.user = validateAddress(this.form.user);
    },
    validateAmount() {
      this.errors.amount = validateAmount(this.form.amount, true)
    },
    hasErrors() {
      return !!this.errors.user || !!this.errors.amount;
    },
    resetErrors() {
      this.errors.user = '';
      this.errors.amount = '';
    },
  },
  emits: ['submit', 'close']
}
</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <form class="modal-content border" @submit.prevent="submit">
        <div class="modal-header">
          <h5 class="modal-title">Freeze Token</h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <!-- Freezer Account -->
          <div class="mb-3">
            <label class="form-label">Freezer Account</label>
            <select v-model="this.form.custodianAccountId" class="form-select" required>
              <option disabled value="">-- select freezer --</option>
              <option v-for="acc in accounts.filter((item) => item.type === 'OPERATOR')" :key="acc.id" :value="acc.id">
                {{ acc.name }}
              </option>
            </select>
          </div>

          <!-- Target Address -->
          <div class="mb-3">
            <label class="form-label">User</label>
            <input
                v-model="this.form.user"
                class="form-control"
                placeholder="User hex address 0x..."
                pattern="^0x[a-fA-F0-9]{40}$"
                @input="validateUser"
                required
            />
            <div v-if="this.errors.user" class="form-text text-danger">{{ this.errors.user }}</div>
          </div>

          <!-- Amount -->
          <div class="mb-3">
            <label class="form-label">Amount to freeze</label>
            <input type="number" class="form-control no-spinner"
                   v-model.number="this.form.amount"
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
          <button class="btn btn-outline-warning btn-sm px-4" type="submit">Freeze</button>
        </div>
      </form>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<style scoped>

</style>