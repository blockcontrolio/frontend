<script>
export default {
  props: {
    modalType: String,
    accounts: Array,
    tokenId: String
  },
  data() {
    return {
      form: {
        pauserAccountId: ''
      }
    };
  },
  computed: {
    name() {
      return this.modalType.replace(/^./, str => str.toUpperCase())
    }
  },
  methods: {
    submit() {
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
        <div class="modal-content bg-dark text-white border border-warning">
          <div class="modal-header">
            <h5 class="modal-title">{{ name }} Token</h5>
            <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
          </div>
          <div class="modal-body">
            <!-- Pauser Account -->
            <div class="mb-3">
              <label class="form-label">Issuer Account</label>
              <select v-model="form.pauserAccountId" class="form-select bg-dark border-warning" required>
                <option disabled value="">-- select pauser --</option>
                <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                  {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
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