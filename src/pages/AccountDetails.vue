<script>
import {formatAmount, formatDate} from "../js/utils.js";
import {fetchAccount, fetchAssetBalances, updateAccount} from "../services/api.js";

export default {
  data() {
    return {
      account: null,
      balances: []
    };
  },
  mounted() {
    const id = this.$route.params.id;
    if (!id || id === "undefined") {
      console.error("Invalid ID passed to fetch account");
      return;
    }
    this.fetchAccount(id);
    this.fetchBalances(id);
  },
  methods: {
    formatAmount,
    formatDate,
    async fetchAccount(id) {
      let res = await fetchAccount(id);
      this.account = await res.json();
    },
    async fetchBalances(id) {
      let res = await fetchAssetBalances(id);
      this.balances = await res.json();
    },
    async updateAccount() {
      const id = this.$route.params.id;
      let newModel = {
        name: this.account.name
      }
      await updateAccount(id, newModel);
    },
    goBack() {
      this.$router.push('/accounts');
    },
  },
};
</script>

<template>

  <div class="container-fluid px-4">
    <h5 class="">Account details: {{ account?.id }}</h5>
    <!-- return to accounts list button -->
    <button
        class="btn btn-outline-secondary my-5"
        @click="goBack"
    >
      Return to List
    </button>
    <div v-if="account" class="card card-glow p-3 mt-3">
      <div class="row mb-2">
        <div class="col-4"><strong>Ref:</strong></div>
        <div class="col-8">{{ account.ref }}</div>
      </div>

      <!-- inline name field -->
      <div class="row mb-2 align-items-center">
        <div class="col-4"><strong>Name:</strong></div>
        <div class="col-8">
          <input v-model="account.name"
                 class="form-control bg-dark text-white border-info mb-2"/>
        </div>
      </div>

      <div class="row mb-2">
        <div class="col-4"><strong>Token Balances:</strong></div>
        <div class="col-8">
          <div v-if="this.balances && this.balances.length">
            <div
                v-for="token in this.balances"
                :key="token.id"
                class="d-flex justify-content-between align-items-center border-bottom border-info py-1"
            >
              <span class="text-white">{{ token.name }} ({{ token.symbol }})</span>
              <span class="text-info mono">{{ formatAmount(token.amount) }}</span>
            </div>
          </div>
          <div v-else class="text-muted">No token balances</div>
        </div>
      </div>
      <div class="row my-2">
        <div class="col-4"><strong>Created:</strong></div>
        <div class="col-8">{{ formatDate(account.createTime) }}</div>
      </div>

      <div class="d-flex justify-content-end mt-4">
        <button
            class="btn btn-primary"
            :disabled="true"
            @click="updateAccount"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

button:disabled {
  opacity: 0.6;
}
</style>
