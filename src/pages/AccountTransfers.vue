<script>
import {useExplorerUtils} from "../js/composables/explorerUtils.js";
import {formatDate, roundAmount} from "../js/utils.js";
import {fetchTransfers} from "../services/api.js";
import AddrScanLink from "../components/etherscan/AddrScanLink.vue";

export default {
  name: 'Transfers',
  components: {AddrScanLink},
  props: ['accountId'],
  setup() {
    const {etherScanLink} = useExplorerUtils();

    return {
      etherScanLink,
    };
  },
  data() {
    return {
      filterType: "", // bound to the dropdown
      transfers: []
    };
  },
  mounted() {
    this.loadTransfers();
  },
  methods: {
    roundAmount,
    formatDate,
    async loadTransfers() {
      const res = await fetchTransfers(this.accountId);
      this.transfers = await res.json();
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back();
      } else {
        this.$router.push('/');
      }
    },
  },
  computed: {
    filteredTransfers() {
      if (!this.filterType || this.filterType === "") {
        return this.transfers;
      }
      return this.transfers.filter(
          (transfer) => transfer.transferType === this.filterType
      );
    }
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

    <!-- filter dropdown -->
    <div class="w-25 my-3">
      <select v-model="filterType" class="form-select">
        <option value="">All Types</option>
        <option value="INTERNAL">INTERNAL</option>
        <option value="EXTERNAL">EXTERNAL</option>
        <option value="CROSS">CROSS COUNTERPARTY</option>
      </select>
    </div>

    <table class="table table-bordered mt-4">
      <thead class="">
      <tr>
        <th scope="col">ID</th>
        <th scope="col">Transfer</th>
        <th v-if="!accountId" scope="col">From</th>
        <th scope="col">To</th>
        <th scope="col">Amount</th>
        <th scope="col" class="text-center">Status</th>
        <th scope="col">Tx Hash</th>
        <th scope="col">Create Time</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="transfer in filteredTransfers" :key="transfer.internalId">
        <td>
          <router-link :to="{ name: 'transfer-details', params: { transferId: transfer.internalId } }">
            {{ transfer.internalId.substring(0, 6) }}…{{ transfer.internalId.substring(transfer.internalId.length - 4) }}
          </router-link>
        </td>
        <td class="mono">{{ transfer.transferType }}</td>
        <td v-if="!accountId" class="mono">
          <router-link :to="{ name: 'account-details', params: { id: transfer.accountFrom.id } }"
                       class="">
            {{ transfer.accountFrom?.name || '(Unnamed)' }}
          </router-link>
        </td>
        <td v-if="transfer.transferType === 'INTERNAL'" class="mono">
          <router-link :to="{ name: 'account-details', params: { id: transfer.accountTo.id } }"
                       class="">
            {{ transfer.accountTo?.name || '(Unnamed)' }}
          </router-link>
        </td>
        <td v-else class="mono">
          <addr-scan-link :type="'account'" :address="transfer.to"></addr-scan-link>
        </td>
        <td class="mono">{{ roundAmount(transfer.asset?.amount) }} {{ transfer.asset?.symbol }}</td>
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
        <td>
          <small class="text-muted">{{ formatDate(transfer.createTime) }}</small>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>