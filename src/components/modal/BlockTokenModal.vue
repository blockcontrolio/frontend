<script>
import {validateAddress} from "../../js/validations.js";

export default {
  props: {
    modalType: String,
    accounts: Array,
    token: Object
  },
  data() {
    return {
      form: {
        limiterAccountId: '',
        user: ''
      },
      errors: {
        user: ''
      },
    };
  },
  computed: {
    name() {
      return this.modalType.replace(/^./, str => str.toUpperCase())
    }
  },
  methods: {
    submit() {
      this.resetErrors();
      this.validateUser();
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
    hasErrors() {
      return !!this.errors.user
    },
    resetErrors() {
      this.errors.user = '';
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
          <h5 class="modal-title">{{ name }} User</h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <!-- Limiter Account -->
          <div class="mb-3">
            <label class="form-label">Limiter Account</label>
            <select v-model="this.form.limiterAccountId" class="form-select" required>
              <option disabled value="">-- select limiter --</option>
              <option v-for="acc in accounts.filter((item) => item.type === 'ADMIN' || item.type === 'OPERATOR')" :key="acc.id" :value="acc.id">
                {{ acc.name }}
              </option>
            </select>
          </div>

          <!-- Target Address -->
          <div class="mb-3">
            <label class="form-label">User</label>
            <input
                v-model="this.form.user"
                class="form-control "
                placeholder="User hex address 0x..."
                pattern="^0x[a-fA-F0-9]{40}$"
                @input="validateUser"
                required
            />
            <div v-if="this.errors.user" class="form-text text-danger">{{ this.errors.user }}</div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline-secondary btn-sm px-4" @click="$emit('close')">Cancel</button>
          <button class="btn btn-outline-warning btn-sm px-4" type="submit">{{ name }}</button>
        </div>
      </form>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<style scoped>

</style>