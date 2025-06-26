<script xmlns="http://www.w3.org/1999/html">
import {useNetworkStore} from "../js/stores/networkStore.js";
import {useCounterpartyStore} from "../js/stores/counterpartyStore.js";
import {
  fetchPartnership,
  requestPartnership,
  acceptRequest,
  rejectRequest, declinePartnership
} from "../services/partnership.js";
import {formatDate} from "../js/utils.js";

export default {
  setup() {
    const networkStore = useNetworkStore();
    const counterpartyStore = useCounterpartyStore();
    return {networkStore, counterpartyStore};
  },
  data() {
    return {
      partnerships: []
    }
  },
  methods: {
    formatDate,
    statusColor(status) {
      switch (status) {
        case 'ACCEPTED':
          return 'text-success';
        case 'REJECTED':
          return 'text-danger';
        default:
          return 'text-light';
      }
    },
    async fetchPartnership(networkId) {
      const res = await fetchPartnership(networkId);
      const partnershipsRaw = await res.json();
      const sourceCounterpartyId = useCounterpartyStore().counterparty.internalId;
      this.partnerships = partnershipsRaw.map(p => ({
        ...p,
        hasNoRelation: !!!p.status,
        ownPendingRequest: p.sourceCounterpartyId === sourceCounterpartyId && p.status === 'PENDING',
        actionRequired: p.relationId && p.status === 'PENDING'
      }));
    },
    async sendRequest(targetCounterpartyId) {
      const response = await requestPartnership(targetCounterpartyId);
      // mark as own request
      if (response.ok) {
        const item = this.partnerships.find(p => p.targetCounterpartyId === targetCounterpartyId);
        if (item) {
          item.ownPendingRequest = true;
          item.hasNoRelation = false;
        }
      }
    },
    async declinePartnership(targetCounterpartyId) {
      const response = await declinePartnership(targetCounterpartyId);
      // mark as own request
      if (response.ok) {
        const item = this.partnerships.find(p => p.targetCounterpartyId === targetCounterpartyId);
        if (item) {
          item.ownPendingRequest = false;
          item.hasNoRelation = true;
        }
      }
    },
    async acceptRequest(requestId) {
      const response = await acceptRequest(requestId);
      if (response.ok) {
        this.pendingRequests = this.pendingRequests.filter(r => r.internalId !== requestId);
      }
    },
    async rejectRequest(requestId) {
      const response = await rejectRequest(requestId);
      if (response.ok) {
        this.pendingRequests = this.pendingRequests.filter(r => r.internalId !== requestId);
      }
    }
  },
  mounted() {
    let selectedNetwork = useNetworkStore().selectedNetwork || useCounterpartyStore().counterparty.networks[0];
    this.fetchPartnership(selectedNetwork?.id);
  }
}
</script>

<template>
  <h3 class="p-2">Partnership Management</h3>
  <div class="container">

    <div class="row g-3">
      <div
          v-for="p in partnerships"
          :key="p.targetCounterpartyId"
          class="col-12"
      >
        <div class="card bg-dark text-white border border-info shadow-sm p-3">
          <div class="row align-items-center">

            <!-- Counterparty Name -->
            <div class="col-3">
              <span class="h6 mb-0">{{ p.counterpartyName }}</span>
            </div>

            <!-- Status -->
            <div class="col-2 text-center">
              <span v-if="p.status" :class="statusColor(p.status)">
                {{ p.status }}
              </span>
            </div>

            <!-- Requested At -->
            <div class="col-3 text-center">
              <span v-if="p.requestedAt" class="text-light">
                Requested: {{ formatDate(p.requestedAt) }}
              </span>
            </div>

            <!-- Action Buttons -->
            <div class="col-4 text-end">
              <button
                  v-if="p.hasNoRelation"
                  class="btn btn-outline-info btn-sm"
                  @click="sendRequest(p.targetCounterpartyId)"
              >
                Request Partnership
              </button>

              <button
                  v-else-if="p.ownPendingRequest"
                  class="btn btn-outline-light btn-sm"
                  @click="declinePartnership(p.targetCounterpartyId)"
              >
                Decline Request
              </button>

              <div
                  v-else-if="p.actionRequired"
                  class="d-flex justify-content-end gap-2"
              >
                <button
                    class="btn btn-outline-danger btn-sm"
                    @click="rejectRequest(p.relationId)"
                >
                  Reject
                </button>
                <button
                    class="btn btn-outline-success btn-sm"
                    @click="acceptRequest(p.relationId)"
                >
                  Accept
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>
