<script>

export default {
  name: 'TxToast',
  props: {
    error: {
      required: true,
      validator(val) {
        return val && typeof val.error === 'string' && typeof val.message === 'string';
      }
    },  // for error: { error, message }
    autoDismiss: {
      type: Boolean,
      default: true
    },
    dismissTimeout: {
      type: Number,
      default: 5000
    }
  },
  data() {
    return {
      visible: true
    };
  },
  mounted() {
    if (this.autoDismiss) {
      setTimeout(() => {
        this.hideToast();
      }, this.dismissTimeout);
    }
  },
  methods: {
    hideToast() {
      this.visible = false;
      this.$emit('closed');
    }
  }
};
</script>

<template>
  <div
      class="position-fixed top-0 end-0 p-4"
      style="z-index: 1055"
      v-if="visible">
    <div
        class="align-items-center text-white"
        style="min-width: fit-content; max-width: none; white-space: nowrap;">
      <div class="alert custom-error-alert d-flex justify-content-between align-items-center m-0">
        <!-- ❌ Error -->
        <div class="m-0">
          ❌ <strong>{{ error?.error }}</strong><br/>
          <span>{{ error?.message }}</span>
        </div>
        <div class="d-flex align-items-center justify-content-center">
          <button
              type="button"
              class="btn-close btn-close-white mx-2"
              @click="hideToast"
              aria-label="Close">
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-error-alert {
  background-color: #1f1f2e; /* deep space dark */
  border-color: #ff4c4c; /* electric red/orange */
  color: #ffcccc; /* light red text for readability */
  border-radius: 0.375rem;
}
</style>