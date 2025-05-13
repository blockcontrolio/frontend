<script>
import {fetchTransactions} from "../services/api.js";
import {formatDate} from "../js/utils.js";
import {copyToClipboard, isClipboardSupported} from "../js/clipboard.js";

export default {
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
    isClipboardSupported,
    copyHash(txHash) {
      copyToClipboard(txHash)
          .then(() => {
            console.log('Tx Hash copied:', txHash);
            // optional: show toast or temporary success indicator
          });
    }
  }
};
</script>

<template>
  <div class="container py-4">
    <h3 class="text-info mb-4">Recent Transaction</h3>

    <div v-if="transactions.length === 0" class="text-white text-center">
      No transactions yet.
    </div>

    <ul class="transaction-list">
      <li v-for="tx in transactions" :key="tx.internalId" class="transaction-item">
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
          <span class="value mono d-flex align-items-center gap-2">
            {{ tx.hash }}
            <i v-if="isClipboardSupported()" class="bi bi-clipboard pointer text-info"
               @click="copyHash(tx.hash)"
               title="Copy to clipboard">
            </i>
          </span>
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

.transaction-item {
  background: rgba(0, 255, 255, 0.05);
  border: 1px solid #00ffff55;
  border-radius: 6px;
  padding: 12px 16px;
  color: #b0fdfd;
}

.tx-line {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.label {
  color: white;
  font-weight: bold;
}

.value {
  color: #ffffff;
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