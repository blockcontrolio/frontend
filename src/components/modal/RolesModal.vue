<script>
export default {
  props: {
    modalType: String,
    accounts: Array,
    tokenId: String
  },
  data() {
    return {
      roles: ['ADMIN', 'MINTER', 'PAUSER', 'BURNER', 'CUSTODIAN', 'LIMITER'],
      form: {
        adminAccountId: '',
        userAccountId: '',
        role: ''
      }
    };
  },
  computed: {
    name() {
      return this.modalType.replace(/^./, str => str.toUpperCase())
    },
    adminAccounts() {
      return this.accounts.filter(acc => acc.type === 'ADMIN')
    },
    userAccounts() {
      return this.accounts.filter(acc => acc.type !== 'ADMIN')
    }
  },
  methods: {
    submit() {
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
      <div class="modal-content bg-dark text-white border border-warning">
        <div class="modal-header">
          <h5 class="modal-title">{{ name }} Role</h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <!-- Admin Account -->
          <div class="mb-3">
            <label class="form-label">Admin Account</label>
            <select v-model="form.adminAccountId" class="form-select bg-dark border-warning" required>
              <option disabled value="">-- select admin --</option>
              <option v-for="acc in adminAccounts" :key="acc.id" :value="acc.id">
                {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
              </option>
            </select>
          </div>
          <!-- User Account -->
          <div class="mb-3">
            <label class="form-label">User Account</label>
            <select v-model="form.userAccountId" class="form-select bg-dark border-warning" required>
              <option disabled value="">-- select user --</option>
              <option v-for="acc in userAccounts" :key="acc.id" :value="acc.id">
                {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
              </option>
            </select>
          </div>
          <!-- Roles -->
          <div class="mb-3">
            <label class="form-label">Role</label>
            <select v-model="form.role" class="form-select bg-dark border-warning" required>
              <option disabled value="">-- select role --</option>
              <option v-for="role in this.roles" :key="role" :value="role">
                {{ role }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary px-4" @click="$emit('close')">Cancel</button>
          <button class="btn btn-outline-primary px-4" @click="submit">{{ name }}</button>
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