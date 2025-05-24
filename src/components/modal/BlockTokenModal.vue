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
  }
}
</script>

<template>
  <div class="modal fade show d-block" tabindex="-1" role="dialog">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content bg-dark text-white border border-warning">
        <div class="modal-header">
          <h5 class="modal-title">{{ name }} User</h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <!-- Limiter Account -->
          <div class="mb-3">
            <label class="form-label">Limiter Account</label>
            <select v-model="this.form.limiterAccountId" class="form-select bg-dark border-warning" required>
              <option disabled value="">-- select limiter --</option>
              <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
              </option>
            </select>
          </div>

          <!-- Target Address -->
          <div class="mb-3">
            <label class="form-label">User</label>
            <input
                v-model="this.form.user"
                class="form-control bg-dark border-warning text-white"
                placeholder="User hex address 0x..."
                pattern="^0x[a-fA-F0-9]{40}$"
                @input="validateUser"
            />
            <div v-if="this.errors.user" class="form-text text-danger">{{ this.errors.user }}</div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-outline-secondary px-4" @click="$emit('close')">Cancel</button>
          <button class="btn btn-outline-warning px-4" @click="submit">{{ name }}</button>
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