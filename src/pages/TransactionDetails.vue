<script>
import {fetchTransaction} from "../services/api.js";
import {formatDate} from "../js/utils.js";
import TxScanLink from "../components/etherscan/TxScanLink.vue";
import AddrScanLink from "../components/etherscan/AddrScanLink.vue";

export default {
  components: {TxScanLink, AddrScanLink},
  data() {
    return {
      transaction: {},
    };
  },
  mounted() {
    const id = this.$route.params.id;
    if (!id || id === "undefined") {
      console.error("Invalid ID passed to fetch transaction");
      return;
    }
    this.fetchTransactionById(id);
  },
  methods: {
    async fetchTransactionById(id) {
      const res = await fetchTransaction(id);
      this.transaction = await res.json();
    },
    formatDate,
    goBack() {
      this.$router.push('/transactions');
    },
  }
};
</script>

<template>

  <h5 class="bold p-2">Transaction details: {{ transaction?.internalId }}</h5>

  <div class="container">
    <!-- return to transactions list button -->
    <button
        class="btn btn-dark btn-sm my-3"
        @click="goBack"
    >
      Return to List
    </button>

    <div class="card border p-3 mt-3">
      <div class="tx-line">
        <span class="label">Type:</span>
        <span class="value">
            <span v-if="transaction.type === 'NATIVE'" class="me-2" title="Native Transfer">🪙</span>
            {{ transaction.type }}
          </span>
      </div>
      <div class="tx-line">
        <span class="label">From:</span>
        <addr-scan-link :type="'account'" :address="transaction.from"></addr-scan-link>
      </div>
      <div class="tx-line">
        <span class="label">To:</span>
        <addr-scan-link :type="'account'" :address="transaction.to"></addr-scan-link>
      </div>
      <div class="tx-line">
        <span class="label">Value:</span>
        <span class="value mono">{{ transaction.value }}</span>
      </div>
      <div class="tx-line">
        <span class="label">Status:</span>
        <span class="status" :class="[transaction.status === 'CONFIRMED' ? 'text-success' : 'text-secondary']">
            {{ transaction.status }}
          </span>
      </div>
      <div class="tx-line">
        <span class="label">Created:</span>
        <span class="value mono">{{ formatDate(transaction.createTime) }}</span>
      </div>
      <div class="tx-line">
        <span class="label">Hash:</span>
        <tx-scan-link :hash="transaction.hash"></tx-scan-link>
      </div>

    </div>
  </div>
</template>

<style scoped>

.tx-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.label {
  font-weight: bold;
}

.value {
  text-align: right;
  margin-left: 1rem;
}

.status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  min-height: 1.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

</style>