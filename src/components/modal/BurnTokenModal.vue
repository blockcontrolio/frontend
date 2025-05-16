<script>
export default {
  props: {
    visible: Boolean,
    accounts: Array,
    tokenId: String
  },
  data() {
    return {
      form: {
        redemptionAccountId: '',
        amount: 0
      }
    };
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
  <div v-if="visible">
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content bg-dark text-white border border-danger">
          <div class="modal-header">
            <h5 class="modal-title">Burn Token</h5>
            <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
          </div>
          <div class="modal-body">
            <!-- Redemption Account -->
            <div class="mb-3">
              <label class="form-label">Redemption Account</label>
              <select v-model="form.redemptionAccountId" class="form-select bg-dark border-danger" required>
                <option disabled value="">-- select account --</option>
                <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
                  {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
                </option>
              </select>
            </div>

            <!-- Amount -->
            <div class="mb-3">
              <label class="form-label">Amount</label>
              <input type="number" class="form-control bg-dark border-danger no-spinner text-white"
                     v-model.number="form.amount"
                     inputmode="numeric"
                     pattern="\d*"
                     min="0"
                     step="1"
                     required/>
            </div>
          </div>

          <div class="modal-footer">
            <button class="btn btn-outline-secondary px-4" @click="$emit('close')">Cancel</button>
            <button class="btn btn-outline-danger px-4" @click="submit">Burn</button>
          </div>
        </div>
      </div>
    </div>
    <div class="modal-backdrop fade show"></div>
  </div>
</template>

<style scoped>
input::placeholder,
select {
  color: #ccc;
}
</style>