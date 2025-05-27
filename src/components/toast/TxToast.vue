<script>

import TxScanLink from "../etherscan/TxScanLink.vue";

export default {
  components: {TxScanLink},
  props: {
    txData: {
      required: true,
      validator(val) {
        return val && typeof val.message === 'string';
      }
    }, // for success: { message, hash, id }
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
      <div
          class="alert custom-success-alert d-flex justify-content-between align-items-center m-0">
        <!-- ✅ Success -->
        <div v-if="txData?.hash">
          ✅ Success! {{ txData.message }}<br/>
          Tx hash:
          <tx-scan-link :hash="txData.hash" class="tx-hash"/>
        </div>
        <div v-if="txData?.id">
          ✅ Success! {{ txData?.message }}<br/>
          UUID:
          <span class="mono">{{txData.id}}</span>
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
.custom-success-alert {
  background-color: #111827;
  border-color: #2af2ff;
  border-radius: 0.375rem;
}

.tx-hash {
  white-space: nowrap;
}
</style>