<script>
import {useExplorerUtils} from "../js/composables/explorerUtils.js";
import {formatTimestamp, roundAmount} from "../js/utils.js";
import {fetchTransfers} from "../services/transfers-api.js";
import TxScanLink from "../components/etherscan/TxScanLink.vue";
import AddrScanLink from "../components/etherscan/AddrScanLink.vue";
import TransferDetailsLink from "../components/links/TransferDetailsLink.vue";

export default {
  name: 'Transfers',
  components: {
    TransferDetailsLink,
    AddrScanLink,
    TxScanLink
  },
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
      filterDirection: "", // bound to the dropdown
      transfers: []
    };
  },
  mounted() {
    this.loadTransfers();
  },
  methods: {
    roundAmount,
    formatTimestamp,
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
      const filters = {
        type: this.filterType,
        direction: this.filterDirection,
        // later: add more fields if needed
      };

      return this.transfers.filter((transfer) => {
        return Object.entries(filters).every(([key, value]) => {
          // skip empty filters
          if (!value || value === "") return true;
          // check field matches
          return transfer[key] === value;
        });
      });
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

    <!-- filter dropdowns -->
    <div class="d-flex my-3 gap-2">
      <select v-model="filterType" class="form-select w-25" v-on:change="filterDirection = ''">
        <option value="">All Types</option>
        <option value="INTERNAL">INTERNAL</option>
        <option value="EXTERNAL">EXTERNAL</option>
        <option value="CROSS_COUNTERPARTY">CROSS COUNTERPARTY</option>
      </select>
      <select v-model="filterDirection" class="form-select w-25" :disabled="!filterType || filterType === 'INTERNAL'">
        <option value="">Direction</option>
        <option value="INCOMING">INCOMING</option>
        <option value="OUTGOING">OUTGOING</option>
      </select>
    </div>

    <table class="table table-bordered mt-4">
      <thead class="">
      <tr>
        <th scope="col">ID</th>
        <th scope="col" style="width: 110px;">Type</th>
        <th scope="col">From</th>
        <th scope="col">To</th>
        <th scope="col">Amount</th>
        <th v-if="false" scope="col" class="text-center">Status</th>
        <th scope="col">Tx Hash</th>
        <th scope="col">Create Time</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="transfer in filteredTransfers" :key="transfer.id">
        <td>
          <transfer-details-link :transfer-id="transfer.id" :short="true"></transfer-details-link>
        </td>
        <td class="">
          <span class="d-flex justify-content-between align-items-center">
          <span class="small me-2">{{ transfer.type }}</span>
            <i v-if="transfer.direction === 'INCOMING'" class="bi bi-arrow-down-left-circle-fill"></i>
          </span>
        </td>
        <!--from-->
        <td class="">
          <span v-if="transfer.type === 'CROSS_COUNTERPARTY' && transfer.direction === 'INCOMING'">
            <i class="bi bi-building me-1"></i>
            {{ transfer.fromCounterparty.name }}
          </span>
          <span v-else-if="transfer.fromAccount.id">
            <i class="bi bi-person-bounding-box me-2"></i>
            <router-link :to="{ name: 'account-details', params: { id: transfer.fromAccount.id } }">
              {{ transfer.fromAccount.name }}
            </router-link>
          </span>
          <addr-scan-link v-else :type="'account'" :address="transfer.fromAddress" :short="true"></addr-scan-link>
        </td>
        <!--to-->
        <td class="">
          <span v-if="transfer.type === 'CROSS_COUNTERPARTY' && transfer.direction === 'OUTGOING'">
            <i class="bi bi-building me-1"></i>
            {{ transfer.toCounterparty.name }}
          </span>
          <span v-else-if="transfer.toAccount.id">
            <i class="bi bi-person-bounding-box me-2"></i>
            <router-link :to="{ name: 'account-details', params: { id: transfer.toAccount.id } }">
              {{ transfer.toAccount.name }}
            </router-link>
          </span>
          <addr-scan-link v-else :type="'account'" :address="transfer.toAddress" :short="true"></addr-scan-link>
        </td>
        <td class="mono">{{ roundAmount(transfer.amount) }} {{ transfer.asset?.symbol }}</td>
        <td v-if="false" class="text-center">
          <span class="badge"
                :class="{ 'bg-success': transfer.status === 'SUCCESS', 'bg-warning': transfer.status === 'PENDING', 'bg-danger': transfer.status === 'FAILED' }">
            {{ transfer.status }}
          </span>
        </td>
        <td>
          <tx-scan-link v-if="transfer.transactionHash" :hash="transfer.transactionHash" :short="true"></tx-scan-link>
        </td>
        <td>
          <small class="text-muted">{{ formatTimestamp(transfer.createdAt) }}</small>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>