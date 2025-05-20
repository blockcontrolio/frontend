<script>
import {fetchCounterpartyInfo} from '../services/api.js';

export default {
  name: "NavBar",
  data() {
    return {
      counterparty: {}
    };
  },
  mounted() {
    this.loadCounterparty();
  },
  methods: {
    async loadCounterparty() {
      const response = await fetchCounterpartyInfo();
      this.counterparty = await response.json();
    }
  }
}
</script>

<template>
  <aside class="sidebar d-flex flex-column justify-content-between">
    <!-- navigation menu -->
    <nav class="nav flex-column nav-pills">
      <h4>BlockControl</h4>
      <div>
        <router-link v-show="false" to="/">Dashboard</router-link>
        <router-link to="/transfer">Asset Transfer</router-link>
        <router-link to="/accounts">Accounts</router-link>
        <router-link to="/tokens">Tokens</router-link>
        <router-link to="/transactions">Transactions</router-link>
        <router-link to="/settings">Settings</router-link>
      </div>
    </nav>

    <!-- bottom section -->

    <div class="footer text-center py-3">
      <hr class="sidebar-divider"/>

      <div v-if="counterparty" class="counterparty-item">
        <div class="counterparty-header mb-2">
          <h5 class="counterparty-name">{{ counterparty.name }}</h5>
          <span class="status-badge">
            <i class="bi bi-building"></i>
          </span>
        </div>

        <!-- display each network -->
        <div v-if="counterparty.networks && counterparty.networks.length">
          <div v-for="(network, index) in counterparty.networks" :key="index" class="network-info mb-2">
            <strong>{{ network.name }}</strong><br/>
            Chain ID: {{ network.chainId }}<br/>
            <a :href="network.explorerUrl" target="_blank" class="text-decoration-underline small">
              Open Explorer
            </a>
          </div>
        </div>
        <span class="text-muted" v-else>No networks assigned</span>
      </div>

    </div>

  </aside>

</template>

<style scoped>

.counterparty-item {
  background-color: #1c1c1e;
  color: #e5e5e5;
  padding: 1rem;
  border-radius: 10px;
}

.counterparty-name {
  font-weight: 600;
  font-size: 1.25rem;
}

.status-badge i {
  color: #00ffff;
  animation: pulse 2s infinite;
}

.network-info a {
  color: #00ffff;
}

.sidebar-divider {
  border-top: 1px solid #444;
}
</style>