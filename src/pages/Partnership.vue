<script xmlns="http://www.w3.org/1999/html">
import {useNetworkStore} from "../js/stores/networkStore.js";
import {useCounterpartyStore} from "../js/stores/counterpartyStore.js";
import {fetchOtherCounterparties} from "../services/api.js";

export default {
  setup() {
    const networkStore = useNetworkStore();
    const counterpartyStore = useCounterpartyStore();
    return {networkStore, counterpartyStore};
  },
  data() {
    return {
      counterparties: []
    }
  },
  computed: {
    network() {
      return useNetworkStore().selectedNetwork;
    },
  },
  methods: {
    async get() {
      const res = await fetchOtherCounterparties(this.network?.id);
      this.counterparties = await res.json();
    }
  },
  mounted() {
    this.get();
  }
}
</script>

<template>
  <div>
    <h3 class="mb-3">Partnership</h3>
    <p v-for="cp in counterparties">{{cp.name}}</p>
  </div>
</template>
