<script>
import {formatAmount, formatDate} from "../js/utils.js";
import {fetchAccount, fetchAccounts, fetchAssetBalances, updateAccount} from "../services/api.js";
import AccountTypeSelect from "../components/AccountTypeSelect.vue";

export default {
  components: {AccountTypeSelect},
  data() {
    return {
      accounts: [],
      accountTypes: ['ADMIN', 'ISSUER', 'DISTRIBUTOR', 'CLIENT', 'PAUSER', 'CUSTODIAN', 'LIMITER'],
      account: {
        ref: "",
        name: "",
        type: "",
        walletType: "",
        paymasterId: null
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
    async fetchAccounts() {
      let res = await fetchAccounts();
      this.accounts = await res.json();
    },
    async fetchAccount(id) {
      let res = await fetchAccount(id);
      let account = await res.json();
      this.account = {...account};
      this.originalAccount = {...account}; // deep clone
      if (this.originalAccount.walletType === "SMART") {
        await this.fetchAccounts()
            .filter(item => item.walletType !== 'SMART'); // only EOA can be paymaster
      }
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
    availableAccountTypes() {
      if (this.account.type === 'ADMIN') {
        return ['ADMIN'];
      }
      return this.accountTypes;
    },
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
      <div class="row mb-3">
        <div class="col-4"><strong>Ref:</strong></div>
        <div class="col-8">{{ account.ref }}</div>
      </div>

      <!-- inline name field -->
      <div class="row mb-3 align-items-center">
        <div class="col-4"><strong>Name:</strong></div>
        <div class="col-8">
          <input v-model="account.name" class="form-control"/>
        </div>
      </div>
      <div class="row mb-3">
        <div class="col-4"><strong>Type:</strong></div>
        <div class="col-8">
          <AccountTypeSelect
              v-model="account.type"
              :account-types="availableAccountTypes"
          />
        </div>
      </div>

      <!-- change paymaster account for only SMART -->
      <div class="row mb-3" v-if="account.walletType === 'EOA'">
        <div class="col-4"><strong>Paymaster Account:</strong></div>
        <div class="col-8">
          <select v-model="account.paymasterId" class="form-select w-50" required>
            <option disabled value="">-- select paymaster --</option>
            <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
              {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
            </option>
          </select>
        </div>
      </div>

      <div class="row mb-3">
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
