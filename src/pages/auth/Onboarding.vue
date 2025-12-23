<script>

import {useNetworkStore} from "../../js/stores/networkStore.js";
import {onboard} from "../../services/onboarding.js";
import {useCounterpartyStore} from "../../js/stores/counterpartyStore.js";
import {initStores} from "../../js/stores/initStores.js";

export default {
  setup() {
    const networkStore = useNetworkStore();
    const counterpartyStore = useCounterpartyStore();
    return {networkStore, counterpartyStore};
  },
  data() {
    return {
      types: [
        {
          code: 'EMI', desc: 'Electronic Money Institution'
        },
        {
          code: 'LSP', desc: 'Licensed Service Provider'
        }],
      form: {
        counterpartyName: "",
        networkId: "",
        counterpartyType: ""
      },
      error: null,
      loading: false,
    };
  },
  computed: {
    networks() {
      return useNetworkStore().networks;
    },
  },
  async created() {
    const store = useNetworkStore();
    if (!store.networks.length) {
      await store.fetchNetworks();
    }
  },
  async mounted() {
    // redirect if onboarded
    if (this.counterpartyStore.isOnboarded) {
      this.$router.push("/dashboard");
    }
  },
  methods: {
    async register() {
      this.error = null;
      this.loading = true;

      try {
        const res = await onboard(this.form);

        const isJson = res.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await res.json() : null;

        if (!res.ok) {
          this.error = data?.error || res.statusText || "Onboarding failed";
          this.loading = false;
          return;
        }

        if (data.id) {
          await initStores(); // preselect network after onboarding
          this.$router.push('/');
        }
      } catch (err) {
        this.error = err.message || "Unexpected error";
      } finally {
        this.loading = false;
      }
    }
  },
};
</script>

<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="w-50" style="max-width: 500px;">
      <div class="card p-4">
        <h4 class="bold text-center mb-4">Register Your Company</h4>

        <form @submit.prevent="register">

          <div class="mb-3">
            <label class="form-label">Counterparty Name</label>
            <input v-model="form.counterpartyName" type="text" class="form-control"
                   required/>
          </div>

          <div class="mb-3">
            <label class="form-label">Counterparty Type</label>
            <select v-model="form.counterpartyType" class="form-select" required>
              <option disabled value="">-- counterparty type --</option>
              <option v-for="type in types" :key="type.code" :value="type.code">
                {{ type.desc }}
              </option>
            </select>
          </div>

          <div class="mb-3">
            <label class="form-label">Select Network</label>
            <select v-model="form.networkId" class="form-select" required>
              <option disabled value="">-- network --</option>
              <option v-for="net in networks" :key="net.id" :value="net.id">
                {{ net.name }}
              </option>
            </select>
          </div>
          <button type="submit" class="btn btn-outline-primary btn-sm w-100" :disabled="loading">
            {{ loading ? 'Registering...' : 'Register' }}
          </button>
        </form>
        <div v-if="error" class="text-danger mt-3">{{ error }}</div>
      </div>
    </div>
  </div>
</template>
