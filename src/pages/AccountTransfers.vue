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
  <h3 class="bold p-2">Recent Asset Transfers</h3>
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
        <th v-if="!accountId" scope="col">From</th>
        <th scope="col">Transfer Type</th>
        <th scope="col">To</th>
        <th scope="col">Amount</th>
        <th scope="col" class="text-center">Status</th>
        <th scope="col">Tx Hash</th>
        <th scope="col">Create Time</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="transfer in transfers" :key="transfer.internalId">
        <td v-if="!accountId" class="mono">
          <router-link :to="{ name: 'account-details', params: { id: transfer.accountFrom.id } }"
                       class="">
            {{ transfer.accountFrom?.name || '(Unnamed)' }}
          </router-link>
        </td>
        <td class="mono">{{ transfer.transferType }}</td>
        <td v-if="transfer.transferType === 'INTERNAL'" class="mono">
          <router-link :to="{ name: 'account-details', params: { id: transfer.accountTo.id } }"
                       class="">
            {{ transfer.accountTo?.name || '(Unnamed)' }}
          </router-link>
        </td>
        <td v-else-if="transfer.transferType === 'CROSS'" class="mono">
          {{ transfer.counterpartyTo?.name }} :: {{ transfer.accountTo?.name || '(Unnamed Account)' }}
        </td>
        <td v-else class="mono">{{ transfer.to }}</td>
        <td class="mono">{{ formatAmount(transfer.asset?.amount) }} {{transfer.asset?.symbol}}</td>
        <td class="text-center">
          <span class="badge"
              :class="{ 'bg-success': transfer.status === 'SUCCESS', 'bg-warning': transfer.status === 'PENDING', 'bg-danger': transfer.status === 'FAILED' }">
            {{ transfer.status }}
          </span>
        </td>
        <td>
          <a class="ether-scan-link" :href="etherScanLink(transfer.txHash)" target="_blank" rel="noopener noreferrer">
            <code>
              {{ transfer.txHash.slice(0, 10) }}...
            </code>
          </a>
        </td>
        <td class="mono">
          {{ formatDate(transfer.createTime) }}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>