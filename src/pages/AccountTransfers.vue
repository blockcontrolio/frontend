<script>
import {useExplorerUtils} from "../js/composables/explorerUtils.js";
import {formatAmount, formatDate} from "../js/utils.js";
import {fetchTransfers} from "../services/api.js";

export default {
  name: 'Transfers',
  props: ['accountId'],
  setup() {
    const {etherScanLink} = useExplorerUtils();

    return {
      etherScanLink,
    };
  },
  data() {
    return {
      transfers: []
    };
  },
  mounted() {
    this.loadTransfers();
  },
  methods: {
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
  <h3 class="bold p-2">Recent Transfers</h3>
  <div class="px-2 mt-3">
    <!-- return to accounts list button -->
    <button
        class="btn btn-dark btn-sm my-3"
        @click="goBack"
    >
      Return to List
    </button>
    <table class="table table-bordered mt-4">
      <thead class="">
      <tr>
        <th scope="col">To</th>
        <th scope="col">Amount</th>
        <th scope="col" class="text-center">Status</th>
        <th scope="col">Tx Hash</th>
        <th scope="col">Create Time</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="tx in transfers" :key="tx.txHash">
        <td>{{ tx.to }}</td>
        <td>{{ formatAmount(tx.amount) }}</td>
        <td class="text-center">
          <span class="badge"
              :class="{ 'bg-success': tx.status === 'SUCCESS', 'bg-warning': tx.status === 'PENDING', 'bg-danger': tx.status === 'FAILED' }">
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