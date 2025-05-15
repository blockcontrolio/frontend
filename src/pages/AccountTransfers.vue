<script>
import {etherScanLink, formatAmount, formatDate} from "../js/utils.js";
import {fetchTransfers} from "../services/api.js";

export default {
  name: 'Transfers',
  props: ['accountId'],
  data() {
    return {
      transfers: []
    };
  },
  mounted() {
    this.loadTransfers();
  },
  methods: {
    etherScanLink,
    formatAmount,
    formatDate,
    async loadTransfers() {
      const res = await fetchTransfers(this.accountId);
      this.transfers = await res.json();
    },
    goBack() {
      this.$router.push('/accounts');
    },
  }
};
</script>

<template>
  <div>
    <h3 class="mb-3">Recent Transfers</h3>
    <!-- return to accounts list button -->
    <button
        class="btn btn-outline-secondary my-5"
        @click="goBack"
    >
      Return to List
    </button>
    <table class="table table-dark table-hover table-bordered table-glow">
      <thead class="text-white" style="background-color: #1a1f2b;">
      <tr>
        <th scope="col">To</th>
        <th scope="col">Amount</th>
        <th scope="col" class="text-center">Status</th>
        <th scope="col">Tx Hash</th>
        <th scope="col">Created</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="tx in transfers" :key="tx.txHash">
        <td>{{ tx.to }}</td>
        <td>{{ formatAmount(tx.amount) }}</td>
        <td class="text-center">
          <span class="badge"
              :class="{ 'bg-success': tx.status === 'SUCCESS', 'bg-warning text-dark': tx.status === 'PENDING', 'bg-danger': tx.status === 'FAILED' }">
            {{ tx.status }}
          </span>
        </td>
        <td>
          <a class="ether-scan-link" :href="etherScanLink(tx.txHash)" target="_blank" rel="noopener noreferrer">
            <code>
              {{ tx.txHash.slice(0, 10) }}...
            </code>
          </a>
        </td>
        <td>
          {{ formatDate(tx.createTime) }}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>