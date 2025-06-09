<script>
import {useCounterpartyStore} from "../js/stores/counterpartyStore.js";
import {resetAllStores} from "../js/stores/resetStores.js";

export default {
  name: "NavBar",
  setup() {
    const store = useCounterpartyStore();
    return {store};
  },
  computed: {
    counterparty() {
      return this.store.counterparty;
    },
  },
  created() {
    if (this.hasApiKey()) {
      this.store.fetchCounterparty();
    }
  },
  methods: {
    hasApiKey() {
      return !!localStorage.getItem('x-api-key');
    },
    handleClick(e) {
      if (!this.hasApiKey()) {
        e.preventDefault();
        this.$emit('missing-jwt');
      }
    },
    logout() {
      localStorage.removeItem("x-api-key");
      resetAllStores();
      this.$router.push("/login");
    }
  },
  emits: ['missing-jwt'],
}
</script>

<template>
  <aside class="sidebar d-flex flex-column justify-content-between">
    <!-- navigation menu -->
    <nav class="nav flex-column nav-pills">
      <h4>BlockControl</h4>
      <div>
        <router-link v-show="false" to="/">Dashboard</router-link>
        <router-link :to="hasApiKey() ? '/transfer' : ''" @click.prevent="handleClick">Asset Transfer</router-link>
        <router-link :to="hasApiKey() ? '/accounts' : ''" @click.prevent="handleClick">Accounts</router-link>
        <router-link :to="hasApiKey() ? '/tokens' : ''" @click.prevent="handleClick">Tokens</router-link>
        <router-link :to="hasApiKey() ? '/transactions' : ''" @click.prevent="handleClick">Transactions</router-link>
        <router-link v-show="false" to="/settings">Settings</router-link>
      </div>
    </nav>

    <!-- bottom section -->

    <div class="footer text-center py-3">
      <hr class="sidebar-divider"/>

      <div v-if="counterparty" class="counterparty-item">
        <div class="counterparty-header mb-2">
          <button v-if="counterparty.name" class="btn text-info p-1" title="Logout" @click="logout">
            <i class="bi bi-box-arrow-right"></i>
          </button>
          <h5 v-if="counterparty.name" class="counterparty-name">{{ counterparty.name }}</h5>
          <h5 v-else class="text-danger">{{ 'Login Error' }}</h5>
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
        <span class="text-danger" v-else>No networks loaded</span>
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