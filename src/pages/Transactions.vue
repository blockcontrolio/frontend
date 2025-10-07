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

  <h3 class="bold p-2 pt-3">Recent Transactions</h3>

  <div class="p-2 mt-3">
    <div v-if="transactions.length === 0" class="text-center">
      No transactions detected yet.
    </div>

    <div v-if="transactions && transactions.length > 0" class="pt-3">
      <table class="table table-bordered">
        <thead>
        <tr>
          <th scope="col">ID</th>
          <th scope="col">Type</th>
          <th scope="col">From</th>
          <th scope="col">Status</th>
          <th scope="col">Value</th>
          <th scope="col">Create Time</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="tx in transactions" :key="tx.id">
          <td>
            <router-link class="text-nowrap"
                :to="{ name: 'transaction-details', params: { id: tx.id } }">
              {{ tx.id.substring(0, 6) }}…{{ tx.id.substring(tx.id.length - 4) }}
            </router-link>
          </td>
          <td>
            <span>
              {{ tx.type }}
            </span>
          </td>
          <td>
            <span class="mono">{{ tx.from }}</span>
          </td>
          <td>
            <span class="status" :class="[tx.status === 'CONFIRMED' ? 'text-success' : 'text-secondary']">
            {{ tx.status }}
          </span>
          </td>
          <td>
            <span class="mono">{{ tx.value }}</span>
          </td>
          <td>
            <small class="text-muted">{{ formatDate(tx.createTime) }}</small>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
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