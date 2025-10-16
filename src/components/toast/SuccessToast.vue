<script>

import TxScanLink from "../etherscan/TxScanLink.vue";
import TxDetailsLink from "../links/TxDetailsLink.vue";
import TransferDetailsLink from "../links/TransferDetailsLink.vue";

export default {
  components: {
    TransferDetailsLink,
    TxScanLink,
    TxDetailsLink
  },
  props: {
    success: {
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
        class="align-items-center"
        style="min-width: fit-content; max-width: none; white-space: nowrap;">
      <div
          class="alert custom-success-alert d-flex justify-content-between align-items-center m-0">
        <!-- Success -->
        <div v-if="success?.transferId">
          Success! {{ success?.message }}<br/>
          Transfer details:
          <transfer-details-link :transferId="success.transferId" class="text-nowrap"/>
        </div>
        <div v-if="success?.hash">
          Success! {{ success.message }}<br/>
          Tx hash:
          <tx-scan-link :hash="success.hash" class="text-nowrap"/>
        </div>
        <div v-if="success?.transactionId">
          Success! {{ success?.message }}<br/>
          Transaction details:
          <tx-details-link :transactionId="success.transactionId" class="text-nowrap"/>
        </div>
        <div class="d-flex align-items-center justify-content-center">
          <button
              type="button"
              class="btn-close mx-2"
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
  background-color: var(--color-bg-card);
  border-color: var(--color-border);
  color: var(--color-text-main);
  border-radius: 0.375rem;
}

</style>