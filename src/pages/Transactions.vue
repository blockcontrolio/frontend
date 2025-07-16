<script>
import {fetchTransactions} from "../services/api.js";
import {formatDate} from "../js/utils.js";
import TxScanLink from "../components/etherscan/TxScanLink.vue";

export default {
  components: {TxScanLink},
  data() {
    return {
      transactions: [],
    };
  },
  mounted() {
    this.fetchTransactions();
  },
  methods: {
    async fetchTransactions() {
      const res = await fetchTransactions();
      this.transactions = await res.json();
    },
    formatDate,
  }
};
</script>

<template>

  <h3 class="bold p-2 pt-3">Recent Transaction</h3>

  <div class="p-2 mt-3">
    <div v-if="transactions.length === 0" class="text-center">
      No transactions yet.
    </div>

    <ul class="transaction-list">
      <li v-for="tx in transactions" :key="tx.internalId" class="card border p-3">
        <div class="tx-line">
          <span class="label">Type:</span>
          <span class="value">
            <span v-if="tx.type === 'NATIVE'" class="me-2" title="Native Transfer">🪙</span>
            {{ tx.type }}
          </span>
        </div>
        <div class="tx-line">
          <span class="label">From:</span>
          <span class="value mono">{{ tx.from }}</span>
        </div>
        <div class="tx-line">
          <span class="label">To:</span>
          <span class="value mono">{{ tx.to }}</span>
        </div>
        <div class="tx-line">
          <span class="label">Value:</span>
          <span class="value mono">{{ tx.value }}</span>
        </div>
        <div class="tx-line">
          <span class="label">Status:</span>
          <span class="status" :class="['badge', tx.status === 'CONFIRMED' ? 'bg-success' : 'bg-secondary']">
            {{ tx.status }}
          </span>
        </div>
        <div class="tx-line">
          <span class="label">Created:</span>
          <span class="value mono">{{ formatDate(tx.createTime) }}</span>
        </div>
        <div class="tx-line">
          <span class="label">Hash:</span>
          <tx-scan-link :hash="tx.hash"></tx-scan-link>
        </div>
      </li>
    </ul>
  </div>
</template>

<style scoped>
.transaction-list {
  list-style: none;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

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
  padding: 0.35rem 0.75rem;
  font-size: 0.75rem;
  font-weight: 600;
  border-radius: 0.5rem;
  min-height: 1.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

</style>