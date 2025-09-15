<script>
import {fetchTransferDetails} from "../services/api.js";
import {formatAmount, formatDate} from "../js/utils.js";
import TxScanLink from "../components/etherscan/TxScanLink.vue";
import AddrScanLink from "../components/etherscan/AddrScanLink.vue";

export default {
  components: {TxScanLink, AddrScanLink},
  data() {
    return {
      transfer: {},
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

    <div class="card border p-3 mt-3">
      <div class="tx-line">
        <span class="label">Type:</span>
        <span class="value">
            {{ transfer.transferType }}
          </span>
      </div>
      <div class="tx-line">
        <span class="label">Account From:</span>
        <router-link v-if="transfer.accountFrom && transfer.accountFrom.id"
                     :to="{ name: 'account-details', params: { id: transfer.accountFrom.id } }">
          {{ transfer.accountFrom?.name }}
        </router-link>
      </div>
      <div class="tx-line" v-if="transfer.transferType === 'CROSS'">
        <span class="label">Counterparty To:</span>
        {{ transfer.counterpartyTo?.name }} :: {{ transfer.accountTo?.name || '(Unnamed Account)' }}
      </div>
      <div class="tx-line" v-if="transfer.transferType === ('INTERNAL' || 'CROSS')">
        <span class="label">Account To:</span>
        <router-link v-if="transfer.accountTo && transfer.accountTo.id"
                     :to="{ name: 'account-details', params: { id: transfer.accountTo.id } }">
          {{ transfer.accountTo?.name }}
        </router-link>
      </div>
      <div class="tx-line" v-if="transfer.transferType === 'EXTERNAL'">
        <span class="label">To:</span>
        <addr-scan-link :type="'account'" :address="transfer.to"></addr-scan-link>
      </div>
      <div class="tx-line">
        <span class="label">Amount:</span>
        <span class="value mono">{{ formatAmount(transfer.asset?.amount) }} {{transfer.asset?.symbol}}</span>
      </div>
      <div class="tx-line">
        <span class="label">Status:</span>
        <span class="status" :class="[transfer.status === 'CONFIRMED' ? 'text-success' : 'text-secondary']">
            {{ transfer.status }}
          </span>
      </div>
      <div class="tx-line">
        <span class="label">Created:</span>
        <small class="text-muted">{{ formatDate(transfer.createTime) }}</small>
      </div>
      <div class="tx-line">
        <span class="label">Hash:</span>
        <tx-scan-link :hash="transfer.txHash"></tx-scan-link>
      </div>

    </div>
  </div>
</template>

<style scoped>

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
  font-size: 0.75rem;
  min-height: 1.8rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

</style>