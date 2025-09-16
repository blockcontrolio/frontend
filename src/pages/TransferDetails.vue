<script>
import {fetchTransferDetails} from "../services/api.js";
import {formatAmount, formatDate} from "../js/utils.js";
import TxScanLink from "../components/etherscan/TxScanLink.vue";
import AddrScanLink from "../components/etherscan/AddrScanLink.vue";

export default {
  components: {TxScanLink, AddrScanLink},
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
    formatDate,
    goBack() {
      this.$router.push('/transfers');
    },
  }
};
</script>

<template>

  <h5 class="bold p-2">Transfer details: {{ transfer?.internalId }}</h5>

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
            {{ transfer.transferType }}
          </span>
      </div>
      <!-- from -->
      <hr class="account-divider"/>
      <span class="mb-1">From:</span>
      <div class="tx-line my-1" v-if="transfer.from.counterpartyId">
        <span class="small mx-3">Counterparty:</span>
        <span><i class="bi bi-building me-2"></i>{{ transfer.from.counterpartyName }}</span>
      </div>
      <div class="tx-line my-1" v-if="transfer.from.accountId">
        <span class="small mx-3">From:</span>
        <span>
          <i class="bi bi-person-bounding-box me-2"></i>
          <router-link :to="{ name: 'account-details', params: { id: transfer.from.accountId } }">
            {{ transfer.from.accountName }}
          </router-link>
        </span>
      </div>
      <div class="tx-line my-1" v-if="transfer.from.address">
        <span class="small mx-3">Address:</span>
        <addr-scan-link :type="'account'" :address="transfer.from.address"></addr-scan-link>
      </div>
      <!-- to-->
      <hr class="account-divider"/>
      <span class="mb-1">To:</span>
      <div class="tx-line" v-if="transfer.to.counterpartyId">
        <span class="small mx-3">Counterparty:</span>
        <span><i class="bi bi-building me-2"></i>{{ transfer.to.counterpartyName }}</span>
      </div>
      <div class="tx-line my-1" v-if="transfer.to.accountId">
        <span class="small mx-3">Account:</span>
        <span>
          <i class="bi bi-person-bounding-box me-2"></i>
          <router-link :to="{ name: 'account-details', params: { id: transfer.to.accountId } }">
            {{ transfer.to.accountName }}
          </router-link>
        </span>
      </div>
      <div class="tx-line my-1" v-if="transfer.to.address">
        <span class="small mx-3">Address:</span>
        <addr-scan-link :type="'account'" :address="transfer.to.address"></addr-scan-link>
      </div>
      <hr class="account-divider"/>
      <div class="tx-line my-1">
        <span class="">Amount:</span>
        <span class="value mono">{{ formatAmount(transfer.asset?.amount) }} {{transfer.asset?.symbol}}</span>
      </div>
      <div class="tx-line my-1">
        <span class="">Status:</span>
        <span class="status" :class="[transfer.status === 'CONFIRMED' ? 'text-success' : 'text-secondary']">
            {{ transfer.status }}
          </span>
      </div>
      <div class="tx-line my-1">
        <span class="">Created:</span>
        <small class="mono text-muted">{{ formatDate(transfer.createTime) }}</small>
      </div>
      <div class="tx-line my-1">
        <span class="">Hash:</span>
        <tx-scan-link :hash="transfer.txHash"></tx-scan-link>
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