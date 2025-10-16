<script>
import {fetchTransferDetails} from "../services/transfers-api.js";
import {formatAmount, formatTimestamp} from "../js/utils.js";
import AddrScanLink from "../components/etherscan/AddrScanLink.vue";
import TxScanLink from "../components/etherscan/TxScanLink.vue";

export default {
  components: {
    AddrScanLink,
    TxScanLink
  },
  data() {
    return {
      transfer: null,
    };
  },
  mounted() {
    const id = this.$route.params.transferId;
    if (!id || id === "undefined") {
      console.error("Invalid ID passed to fetch transfer");
      return;
    }
    this.fetchTransferById(id);
  },
  methods: {
    formatAmount,
    async fetchTransferById(id) {
      const res = await fetchTransferDetails(id);
      this.transfer = await res.json();
    },
    formatTimestamp,
    goBack() {
      this.$router.push('/transfers');
    },
  }
};
</script>

<template>

  <h5 class="bold p-2">Transfer details: {{ transfer?.id }}</h5>

  <div class="container">
    <!-- return to transfers list button -->
    <button
        class="btn btn-dark btn-sm my-3"
        @click="goBack"
    >
      Return to List
    </button>

    <div v-if="transfer" class="card border p-3 mt-3">
      <div class="tx-line my-1">
        <span class="">Type:</span>
        <span class="value">
            {{ transfer.type }}
          </span>
      </div>
      <!-- from -->
      <hr class="account-divider"/>
      <span class="mb-1">From:</span>
      <div class="tx-line my-1" v-if="transfer.fromCounterparty.id">
        <span class="small mx-3">Counterparty:</span>
        <span><i class="bi bi-building me-2"></i>{{ transfer.fromCounterparty.name }}</span>
      </div>
      <div class="tx-line my-1" v-if="transfer.fromAccount.id">
        <span class="small mx-3">From:</span>
        <span>
          <i class="bi bi-person-bounding-box me-2"></i>
          <span v-if="transfer.type === 'CROSS_COUNTERPARTY' && transfer.direction === 'INCOMING'">
            {{ transfer.fromAccount.name }}
          </span>
          <router-link v-else :to="{ name: 'account-details', params: { id: transfer.fromAccount.id } }">
            {{ transfer.fromAccount.name }}
          </router-link>
        </span>
      </div>
      <div class="tx-line my-1" v-if="transfer.type === 'EXTERNAL' && transfer.direction === 'INCOMING' && transfer.fromAddress">
        <span class="small mx-3">Address:</span>
        <addr-scan-link :type="'account'" :address="transfer.fromAddress"></addr-scan-link>
      </div>
      <!-- to-->
      <hr class="account-divider"/>
      <span class="mb-1">To:</span>
      <div class="tx-line" v-if="transfer.toCounterparty.id">
        <span class="small mx-3">Counterparty:</span>
        <span><i class="bi bi-building me-2"></i>{{ transfer.toCounterparty.name }}</span>
      </div>
      <div class="tx-line my-1" v-if="transfer.toAccount.id">
        <span class="small mx-3">Account:</span>
        <span>
          <i class="bi bi-person-bounding-box me-2"></i>
          <span v-if="transfer.type === 'CROSS_COUNTERPARTY' && transfer.direction === 'OUTGOING'">
            {{ transfer.toAccount.name }}
          </span>
          <router-link v-else :to="{ name: 'account-details', params: { id: transfer.toAccount.id } }">
            {{ transfer.toAccount.name }}
          </router-link>
        </span>
      </div>
      <div class="tx-line my-1" v-if="transfer.type === 'EXTERNAL' && transfer.direction === 'OUTGOING' && transfer.toAddress">
        <span class="small mx-3">Address:</span>
        <addr-scan-link :type="'account'" :address="transfer.toAddress"></addr-scan-link>
      </div>
      <hr class="account-divider"/>
      <div class="tx-line my-1">
        <span class="">Amount:</span>
        <span class="value mono">{{ formatAmount(transfer.amount) }} {{transfer.asset?.symbol}}</span>
      </div>
      <div v-if="transfer.status" class="tx-line my-1">
        <span class="">Status:</span>
        <span class="status" :class="[transfer.status === 'CONFIRMED' ? 'text-success' : 'text-secondary']">
            {{ transfer.status }}
          </span>
      </div>
      <div class="tx-line my-1">
        <span class="">Create Time:</span>
        <small class="mono text-muted">{{ formatTimestamp(transfer.createdAt) }}</small>
      </div>
      <div v-if="transfer.transactionHash" class="tx-line my-1">
        <span class="">Hash:</span>
        <tx-scan-link :hash="transfer.transactionHash"></tx-scan-link>
      </div>

    </div>
  </div>
</template>

<style scoped>

.tx-line {
  display: flex;
  justify-content: space-between;
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

.account-divider {
  border-top: 1px solid #444;
}

</style>