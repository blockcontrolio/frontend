<script>
import {useCounterpartyStore} from "../js/stores/counterpartyStore.js";
import {useNetworkStore} from "../js/stores/networkStore.js";
import {resetAllStores} from "../js/stores/resetStores.js";

export default {
  name: "NavBar",
  setup() {
    const networkStore = useNetworkStore();
    const counterpartyStore = useCounterpartyStore();
    return {networkStore, counterpartyStore};
  },
  computed: {
    counterparty() {
      return this.counterpartyStore.counterparty;
    },
    adminView() {
      return this.counterpartyStore.user?.role === 'ADMIN';
    }
  },
  created() {

  },
  methods: {
    hasAuthToken() {
      return localStorage.getItem('auth-token');
    },
    handleClick(e) {
      if (!this.hasAuthToken()) {
        e.preventDefault();
        this.$emit('missing-jwt');
      }
    },
    logout() {
      localStorage.removeItem("auth-token");
      window.dispatchEvent(new Event('auth-changed'));
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
      <h4 class="mt-2 bold">BlockControl</h4>
      <div>
        <router-link v-if="false" class="nav-link" :to="hasAuthToken() ? '/' : ''" @click.prevent="handleClick">Dashboard</router-link>
        <router-link v-if="adminView" class="nav-link" :to="hasAuthToken() ? '/users' : ''" @click.prevent="handleClick">Users</router-link>
        <hr class="sidebar-divider"/>
        <router-link
            class="nav-link d-flex align-items-center gap-2"
            :to="hasAuthToken() ? '/transfer' : ''"
            @click.prevent="handleClick"
        >
          Send
          <i class="bi bi-arrow-up-right-circle-fill"></i>
        </router-link>

        <router-link
            class="nav-link d-flex align-items-center gap-2"
            :to="hasAuthToken() ? '/receive' : ''"
            @click.prevent="handleClick"
        >
          Receive
          <i class="bi bi-arrow-down-left-circle-fill"></i>
        </router-link>
        <router-link class="nav-link" :to="hasAuthToken() ? '/transfers' : ''" @click.prevent="handleClick">History</router-link>
        <hr class="sidebar-divider"/>
        <router-link class="nav-link" :to="hasAuthToken() ? '/tokens' : ''" @click.prevent="handleClick">Tokens</router-link>
        <router-link class="nav-link" :to="hasAuthToken() ? '/accounts' : ''" @click.prevent="handleClick">Accounts</router-link>
        <router-link class="nav-link" :to="hasAuthToken() ? '/partnership' : ''" @click.prevent="handleClick">Partnership</router-link>
        <router-link class="nav-link" :to="hasAuthToken() ? '/transactions' : ''" @click.prevent="handleClick">Operations</router-link>
      </div>
    </nav>

    <!-- bottom section -->

    <div class="footer text-center py-3">
      <hr class="sidebar-divider"/>

      <div v-if="counterparty" class="counterparty-item">
        <div class="mb-2">
          <button v-if="counterparty.name" class="btn p-1" title="Logout" @click="logout">
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
            <a v-if="network.explorerUrl" :href="network.explorerUrl" target="_blank" class="text-decoration-underline small">
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
  background: var(--color-bg-body);
  padding: 1rem;
  border-radius: 10px;
}

.counterparty-name {
  font-weight: 600;
  font-size: 1.25rem;
}

.status-badge i {
  animation: pulse 2s infinite;
}

.sidebar-divider {
  border-top: 1px solid #444;
}
</style>