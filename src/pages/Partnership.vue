<script xmlns="http://www.w3.org/1999/html">
import {useNetworkStore} from "../js/stores/networkStore.js";
import {useCounterpartyStore} from "../js/stores/counterpartyStore.js";
import {
  fetchPartnerships,
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
          return 'text-warning';
      }
    },
    async fetchPartnerships(networkId) {
      const res = await fetchPartnerships(networkId);
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
    let selectedNetwork = useNetworkStore().selectedNetwork;
    this.fetchPartnerships(selectedNetwork?.id);
  }
}
</script>

<template>
  <h3 class="p-2 pt-3">Partnership Management</h3>
  <div class="container mt-3">

    <div class="row g-3">
      <div
          v-for="p in partnerships"
          :key="p.targetCounterpartyId"
          class="col-12"
      >
        <div class="card border p-3">
          <div class="row align-items-center">

            <!-- Counterparty Name -->
            <div class="col-4 text-start">
              <strong class="text-secondary">{{ p.counterpartyName }}</strong>
            </div>

            <!-- Mid column -->
            <div class="col-5 text-start">
              <div v-if="p.status === 'ACCEPTED'" class="small">
                <div class="label me-2">Accepted tokens:</div>
                <div class="value text-secondary-emphasis">
                  <strong>
                    {{ p.acceptedTokens.map(t => t.symbol).join(', ') }}
                  </strong>
                </div>
              </div>
              <div v-if="p.status === 'PENDING'" class="small">
              <span v-if="p.status === 'PENDING'" class="">
                <span :class="statusColor(p.status)" class="me-2">Requested:</span>{{ formatDate(p.requestedAt) }}
              </span>
              </div>
            </div>

            <!-- Actions column -->
            <div class="col-3 text-end">

            <!-- action buttons -->
            <div v-if="!p.status || p.status === 'PENDING'" class="">
              <button
                  v-if="p.hasRelation === false"
                  class="btn btn-outline-primary btn-sm"
                  @click="sendRequest(p.targetCounterpartyId)"
              >
                Request Partnership
              </button>

              <button
                  v-else-if="p.ownPendingRequest"
                  class="btn btn-outline-danger btn-sm"
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

            <!-- when status final -->
            <div v-else class="small">
              <div v-if="p.status === 'ACCEPTED'" class="label">
                Target Operational Accounts:
                <span class="value me-1">
                  {{ p.targetAccounts.length }}
                </span>
                <i v-if="p.targetAccounts" class="bi bi-check2-circle text-success bold"></i>
                <i v-else class="bi bi-ban text-danger bold"></i>
              </div>
              <span v-if="p.status === 'ACCEPTED' && p.resolvedAt" class="">
                <span :class="statusColor(p.status)" class="me-2">Accepted:</span>{{ formatDate(p.resolvedAt) }}
              </span>
              <span v-if="p.status === 'REJECTED' && p.resolvedAt" class="">
                <span :class="statusColor(p.status)" class="me-2">Rejected:</span>{{ formatDate(p.resolvedAt) }}
              </span>
            </div>
            </div>

          </div>
        </div>
      </div>
    </div>

  </div>
</template>
