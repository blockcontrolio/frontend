<script>
import {formatAmount, formatDate} from "../js/utils.js";
import {fetchAccount, fetchAssetBalances, updateAccount} from "../services/api.js";

export default {
  data() {
    return {
      account: {
        ref: "",
        name: "",
        type: ""
      },
      originalAccount: {},
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
      let account = await res.json();
      this.account = {...account};
      this.originalAccount = {...account}; // deep clone
    },
    async fetchBalances(id) {
      let res = await fetchAssetBalances(id);
      this.balances = await res.json();
    },
    async updateAccount() {
      const id = this.$route.params.id;
      const patch = this.buildPatch(this.account, this.originalAccount);
      if (Object.keys(patch).length === 0) {
        console.log("No changes to send.");
        return;
      }
      await updateAccount(id, patch);
    },
    goBack() {
      this.$router.push('/accounts');
    },
    buildPatch(newModel, originalModel) {
      const patch = {};
      for (const key in newModel) {
        if (newModel[key] !== originalModel[key]) {
          patch[key] = newModel[key];
        }
      }
      return patch;
    }
  },
  computed: {
    hasChanges() {
      if (!this.originalAccount) return false;

      return Object.keys(this.account).some(key => {
        return this.account[key] !== this.originalAccount[key];
      });
    }
  },
};
</script>

<template>
  <h5 class="bold p-2">Account details: {{ account?.id }}</h5>

  <div class="container">
    <!-- return to accounts list button -->
    <button
        class="btn btn-dark btn-sm my-3"
        @click="goBack"
    >
      Return to List
    </button>
    <div v-if="account" class="card p-3 mt-3">
      <div class="row mb-2">
        <div class="col-4"><strong>Ref:</strong></div>
        <div class="col-8">{{ account.ref }}</div>
      </div>

      <!-- inline name field -->
      <div class="row mb-2 align-items-center">
        <div class="col-4"><strong>Name:</strong></div>
        <div class="col-8">
          <input v-model="account.name"
                 class="form-control mb-2"/>
        </div>
      </div>

      <div class="row mb-2">
        <div class="col-4"><strong>Token Balances:</strong></div>
        <div class="col-8">
          <div v-if="this.balances && this.balances.length">
            <div
                v-for="token in this.balances"
                :key="token.id"
                class="d-flex justify-content-between align-items-center border-bottom py-1"
            >
              <span class="">{{ token.name }} ({{ token.symbol }})</span>
              <span class="mono">{{ formatAmount(token.amount) }}</span>
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
            class="btn btn-outline-primary btn-sm"
            :disabled="!hasChanges"
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
