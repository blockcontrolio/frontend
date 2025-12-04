<script>
import {useCounterpartyStore} from "../js/stores/counterpartyStore.js";
import {useNetworkStore} from "../js/stores/networkStore.js";
import {getAccessToken} from "../auth/tokenService.js";

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
    },
    isOnboarded() {
      return this.counterpartyStore.isOnboarded;
    }
  },
  created() {

  },
  methods: {
    onboard() {
      window.location.href = '/onboarding';
    },
    hasAuthToken() {
      return getAccessToken();
    },
    handleClick(e) {
      if (!this.hasAuthToken()) {
        e.preventDefault();
        this.$emit('missing-jwt');
      }
    },
    logout() {
      window.dispatchEvent(new Event('auth-changed'));
      window.location.href = '/logout';
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
        <router-link v-if="adminView" class="nav-link" :to="hasAuthToken() ? '/webhooks' : ''" @click.prevent="handleClick">Webhooks</router-link>
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

      <div v-if="isOnboarded" class="counterparty-item">
        <div class="mb-2">
          <button v-if="counterparty.name" class="btn p-1" title="Logout" @click="logout">
            <i class="bi bi-box-arrow-right"></i>
          </button>
          <h5 v-if="counterparty.name" class="counterparty-name">{{ counterparty.name }}</h5>
          <p v-else class="text-danger">{{ 'Login Error' }}</p>
          <span class="status-badge">
            <i class="bi bi-building"></i>
          </span>
        </div>

        <!-- display each network -->
        <div v-if="counterparty.network">
          <div class="network-info mb-2">
            <span v-if="counterparty.network.name">Network: {{ counterparty.network.name }}</span><br v-if="counterparty.network.name"/>
            <span v-if="counterparty.network.chainId">Chain ID: {{ counterparty.network.chainId }}</span><br v-if="counterparty.network.chainId"/>
            <a v-if="counterparty.network.explorerUrl" :href="counterparty.network.explorerUrl" target="_blank" class="text-decoration-underline small">
              Open Explorer
            </a>
          </div>
        </div>
        <span class="text-danger" v-else>No networks loaded</span>
      </div>
      <div v-else>
        <div class="my-4">
          <p class="text-danger">{{ 'Complete Onboarding' }}</p>
          <div class="d-flex flex-column">
            <button class="btn p-1 btn-sm btn-link" title="Onboard" @click="onboard">
              Onboard
            </button>
            <button class="btn btn-sm btn-link p-1" title="Logout" @click="logout">
              Logout
            </button>
          </div>
        </div>
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