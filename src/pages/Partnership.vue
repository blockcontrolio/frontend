<script xmlns="http://www.w3.org/1999/html">
import {useNetworkStore} from "../js/stores/networkStore.js";
import {useCounterpartyStore} from "../js/stores/counterpartyStore.js";
import {
  fetchPartnership,
  requestPartnership,
  acceptRequest,
  rejectRequest,
  declinePartnership
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
      const loggedInCounterpartyId = useCounterpartyStore().counterparty.internalId;
      this.partnerships = partnershipsRaw.map(p => ({
        ...p,
        hasRelation: p.relationId !== null,
        ownPendingRequest: p.sourceCounterpartyId === loggedInCounterpartyId && p.status === 'PENDING',
        actionRequired: p.targetCounterpartyId === loggedInCounterpartyId && p.status === 'PENDING'
      }));
    },
    async sendRequest(targetCounterpartyId) {
      const response = await requestPartnership(targetCounterpartyId);
      // mark as own request
      if (response.ok) {
        const partnershipRaw = await response.json();
        const item = this.partnerships.find(p => p.targetCounterpartyId === targetCounterpartyId);
        if (item) {
          item.relationId = partnershipRaw.relationId;
          item.status = partnershipRaw.status;
          item.requestedAt = partnershipRaw.requestedAt;
          item.ownPendingRequest = true;
          item.hasRelation = true;
        }
      }
    },
    async declinePartnership(relationId) {
      const response = await declinePartnership(relationId);
      // mark as own request
      if (response.ok) {
        const item = this.partnerships.find(p => p.relationId === relationId);
        if (item) {
          item.relationId = null;
          item.status = null;
          item.requestedAt = null;
          item.ownPendingRequest = false;
          item.hasRelation = false;
        }
      }
    },
    async acceptRequest(relationId) {
      const response = await acceptRequest(relationId);
      if (response.ok) {
        const item = this.partnerships.find(p => p.relationId === relationId);
        if (item) {
          item.status = 'ACCEPTED';
          item.actionRequired = false;
        }
      }
    },
    async rejectRequest(relationId) {
      const response = await rejectRequest(relationId);
      if (response.ok) {
        const item = this.partnerships.find(p => p.relationId === relationId);
        if (item) {
          item.status = 'REJECTED';
          item.actionRequired = false;
        }
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
              <span v-if="p.status === 'PENDING'" class="text-light">
                Requested: {{ formatDate(p.requestedAt) }}
              </span>
              <span v-if="p.status === 'ACCEPTED' && p.resolvedAt" class="text-light">
                Accepted: {{ formatDate(p.resolvedAt) }}
              </span>
              <span v-if="p.status === 'REJECTED' && p.resolvedAt" class="text-light">
                Rejected: {{ formatDate(p.resolvedAt) }}
              </span>

            </div>

            <!-- Action Buttons -->
            <div class="col-4 text-end">
              <button
                  v-if="p.hasRelation === false"
                  class="btn btn-outline-info btn-sm"
                  @click="sendRequest(p.targetCounterpartyId)"
              >
                Request Partnership
              </button>

              <button
                  v-else-if="p.ownPendingRequest"
                  class="btn btn-outline-light btn-sm"
                  @click="declinePartnership(p.relationId)"
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
