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
      const excluded = ['ADMIN', 'CLIENT', 'DISTRIBUTOR'];
      return this.accounts.filter(acc => !excluded.includes(acc.type));
    },
    rolesByType() {
      let selectedAccount = this.accounts.find(acc => acc.id === this.form.userAccountId);
      if (selectedAccount?.type === 'ISSUER') {
        return ['MINTER', 'BURNER'];
      }
      if (selectedAccount?.type === 'OPERATOR') {
        return ['LIMITER', 'PAUSER', 'CUSTODIAN'];
      }
      return this.roles;
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
      <form class="modal-content border" @submit.prevent="submit">
        <div class="modal-header">
          <h5 class="modal-title">{{ name }} Role</h5>
          <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
        </div>
        <div class="modal-body">
          <!-- Admin Account -->
          <div class="mb-3">
            <label class="form-label">Admin Account</label>
            <select v-model="form.adminAccountId" class="form-select" required>
              <option disabled value="">-- select admin --</option>
              <option v-for="acc in adminAccounts" :key="acc.id" :value="acc.id">
                {{ acc.name }}
              </option>
            </select>
          </div>
          <!-- User Account -->
          <div class="mb-3">
            <label class="form-label">User Account</label>
            <select v-model="form.userAccountId" class="form-select" required>
              <option disabled value="">-- select user --</option>
              <option v-for="acc in userAccounts" :key="acc.id" :value="acc.id">
                {{ acc.name }}
              </option>
            </select>
          </div>
          <!-- Roles -->
          <div class="mb-3">
            <label class="form-label">Role</label>
            <select v-model="form.role" class="form-select" required>
              <option disabled value="">-- select role --</option>
              <option v-for="role in rolesByType" :key="role" :value="role">
                {{ role }}
              </option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-outline-secondary btn-sm px-4" @click="$emit('close')">Cancel</button>
          <button class="btn btn-outline-primary btn-sm px-4" type="submit">{{ name }}</button>
        </div>
      </form>
    </div>
  </div>
  <div class="modal-backdrop fade show"></div>
</template>

<style scoped>

</style>