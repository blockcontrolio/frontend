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
  },
  emits: ['submit', 'close']
}
</script>

<template>
    <div class="modal fade show d-block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-dialog-centered">
        <form class="modal-content border" @submit.prevent="submit">
          <div class="modal-header">
            <h5 class="modal-title">{{ name }} Token</h5>
            <button type="button" class="btn-close btn-close-white" @click="$emit('close')"></button>
          </div>
          <div class="modal-body">
            <!-- Pauser Account -->
            <div class="mb-3">
              <label class="form-label">Issuer Account</label>
              <select v-model="form.pauserAccountId" class="form-select" required>
                <option disabled value="">-- select pauser --</option>
                <option v-for="acc in accounts.filter((item) => item.type === 'OPERATOR')" :key="acc.id" :value="acc.id">
                  {{ acc.name }}
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