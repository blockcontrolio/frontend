<script xmlns="http://www.w3.org/1999/html">
import {useNetworkStore} from "../js/stores/networkStore.js";
import {useCounterpartyStore} from "../js/stores/counterpartyStore.js";
import {
  fetchRawPartnerships,
  requestPartnership,
  acceptRequest,
  rejectRequest,
  declinePartnership
} from "../services/partnership-api.js";
import {formatTimestamp} from "../js/utils.js";

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
    formatTimestamp,
    statusColor(status) {
      switch (status) {
        case 'ACCEPTED':
          return 'text-success';
        case 'REJECTED':
          return 'text-danger';
        default:
          return 'text-warning';
      }
    },
    async fetchRawPartnerships(networkId) {
      const res = await fetchRawPartnerships(networkId);
      const partnershipsRaw = await res.json();
      const loggedInCounterpartyId = useCounterpartyStore().counterparty.id;
      this.partnerships = partnershipsRaw.map(p => ({
        ...p,
        hasRelation: p.id !== null,
        ownPendingRequest: p.status === 'PENDING' && p.sourceCounterparty.id === loggedInCounterpartyId,
        actionRequired: p.status === 'PENDING' && p.targetCounterparty.id === loggedInCounterpartyId
      }));
    },
    async sendRequest(targetCounterpartyId) {
      const response = await requestPartnership(targetCounterpartyId);
      // mark as own request
      if (response.ok) {
        const partnershipRaw = await response.json();
        const item = this.partnerships.find(p => p.targetCounterparty.id === targetCounterpartyId);
        if (item) {
          item.id = partnershipRaw.id;
          item.status = partnershipRaw.status;
          item.requestedAt = partnershipRaw.requestedAt;
          item.ownPendingRequest = true;
          item.hasRelation = true;
        }
      }
    },
    async declinePartnership(partnershipId) {
      const response = await declinePartnership(partnershipId);
      // mark as own request
      if (response.ok) {
        const item = this.partnerships.find(p => p.id === partnershipId);
        if (item) {
          item.id = null;
          item.status = null;
          item.requestedAt = null;
          item.ownPendingRequest = false;
          item.hasRelation = false;
        }
      }
    },
    async acceptRequest(partnershipId) {
      const response = await acceptRequest(partnershipId);
      if (response.ok) {
        const item = this.partnerships.find(p => p.id === partnershipId);
        if (item) {
          item.status = 'ACCEPTED';
          item.actionRequired = false;
        }
      }
    },
    async rejectRequest(partnershipId) {
      const response = await rejectRequest(partnershipId);
      if (response.ok) {
        const item = this.partnerships.find(p => p.id === partnershipId);
        if (item) {
          item.status = 'REJECTED';
          item.actionRequired = false;
        }
      }
    }
  },
  mounted() {
    let selectedNetwork = useNetworkStore().selectedNetwork;
    this.fetchRawPartnerships(selectedNetwork?.id);
  }
}
</script>

<template>
  <h3 class="p-2 pt-3">Partnership Management</h3>
  <div class="container mt-3">

    <!-- Header Row -->
    <div class="row fw-bold text-secondary border-bottom pb-2 mb-2 small">
      <div class="col-3">Partnership</div>
      <div class="col-3">Transferable Assets</div>
      <div class="col-2">Status</div>
      <div class="col-2">Last Action</div>
      <div class="col-2 text-center">Actions</div>
    </div>

    <!-- Cards -->
    <div class="row g-2 pt-2">
      <div
          v-for="p in partnerships"
          :key="p.targetCounterparty.id"
          class="col-12"
      >
        <div class="card border-0 rounded-3">
          <div class="card-body py-3">
            <div class="row align-items-center">

              <!-- Partnership -->
              <div class="col-3">
                <div class="fw-semibold">
                  <span v-if="p.sourceCounterparty">
                    <span class="text-muted small me-2">From:</span>
                    {{ p.sourceCounterparty.name }}<br>
                  </span>
                  <span class="text-muted small me-2">To:</span>
                  <span class="">{{ p.targetCounterparty.name }}</span>
                </div>
              </div>

              <!-- Assets -->
              <div class="col-3 small">
                <div class="fw-semibold text-secondary-emphasis">
                  {{
                    p.partneredAssets?.length
                        ? p.partneredAssets.map(t => t.symbol).join(', ')
                        : ''
                  }}
                </div>
              </div>

              <!-- Status -->
              <div class="col-2 small">
                <span v-if="p.status" :class="statusColor(p.status)" class="fw-semibold">
                  {{ p.status }}
                </span>
                <span v-else class="text-muted fst-italic">Not initiated</span>
              </div>

              <!-- Date -->
              <div class="col-2 small text-muted">
                <template v-if="p.status === 'PENDING'">
                  {{ formatTimestamp(p.requestedAt) }}
                </template>
                <template v-else-if="p.status === 'ACCEPTED' || p.status === 'REJECTED'">
                  {{ formatTimestamp(p.resolvedAt) }}
                </template>
              </div>

              <!-- Actions -->
              <div class="col-2 text-end">
                <template v-if="!p.status || p.hasRelation === false">
                  <button
                      class="btn btn-outline-primary btn-sm"
                      @click="sendRequest(p.targetCounterparty.id)"
                  >
                    Request
                  </button>
                </template>

                <template v-else-if="p.ownPendingRequest">
                  <button
                      class="btn btn-outline-danger btn-sm"
                      @click="declinePartnership(p.id)"
                  >
                    Cancel
                  </button>
                </template>

                <template v-else-if="p.actionRequired">
                  <div class="d-flex justify-content-end gap-2">
                    <button
                        class="btn btn-outline-danger btn-sm"
                        @click="rejectRequest(p.id)"
                    >
                      Reject
                    </button>
                    <button
                        class="btn btn-outline-success btn-sm"
                        @click="acceptRequest(p.id)"
                    >
                      Accept
                    </button>
                  </div>
                </template>

                <template v-else-if="p.status === 'ACCEPTED'">
                  <button
                      class="btn btn-outline-danger btn-sm"
                      @click="rejectRequest(p.id)"
                  >
                    Reject
                  </button>
                </template>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>
