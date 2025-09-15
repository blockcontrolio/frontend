<script>
import {useRouter} from "vue-router";
import {createAccount, fetchAccounts} from '../services/api'
import {formatDate} from "../js/utils.js";
import AddrScanLink from "../components/etherscan/AddrScanLink.vue";
import AccountTypeSelect from "../components/AccountTypeSelect.vue";
import {useCounterpartyStore} from "../js/stores/counterpartyStore.js";
import ErrorToast from "../components/toast/ErrorToast.vue";
import InfoToast from "../components/toast/InfoToast.vue";

export default {
  components: {InfoToast, ErrorToast, AccountTypeSelect, AddrScanLink},
  setup() {
    let router = useRouter();
    const counterpartyStore = useCounterpartyStore();
    return {router, counterpartyStore}
  },
  data() {
    return {
      accountTypes: ['ADMIN', 'ISSUER', 'DISTRIBUTOR', 'OPERATOR', 'CLIENT'],
      walletTypes: [
        {
          code: 'EOA', desc: 'Externally Owned Account'
        },
        {
          code: 'SMART', desc: 'Smart Contract Account'
        }],
      searchQuery: "",
      accounts: [],
      form: {name: "", externalId: "", type: "", walletType: "", paymasterId: ""},
      showCreateForm: false,
      errors: {
        name: ""
      },
      success: null,
      error: null
    }
  },
  methods: {
    formatDate,
    async fetchAccounts() {
      let res = await fetchAccounts();
      this.accounts = await res.json();
    },
    async createAccount() {
      this.resetError();
      this.validateName();
      if (this.hasErrors) {
        return;
      }
      try {
        const res = await createAccount(this.form);
        if (res.ok) {
          const added = await res.json();
          this.accounts.push({...added, show: false});
          this.success = `${this.form.type} account has been created`;
          this.clearForm();
          this.showCreateForm = false; // hide form
        } else {
          const err = await res.json();
          this.handleError(err);
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    handleError(err) {
      this.success = null;
      this.error = {
        error: err.error || 'Error',
        message: err.message || 'Failed to create account.'
      };
    },
    handleUnknownError(err) {
      console.error(err)
      this.success = null;
      this.error = {
        error: 'Network Error',
        message: err.message
      };
    },
    clearForm() {
      this.form = {externalId: "", name: "", type: "", walletType: "", paymasterId: ""}; // clear inputs
    },
    validateName() {
      if (this.form.name.length < 4) {
        this.errors.name = 'Name must be unique and contain at least 4 letters or numbers';
      } else {
        this.errors.name = "";
      }
    },
    resetError() {
      this.errors.name = null;
    },
    findMasterAccName(paymasterId) {
      return this.accounts.find(acc => acc.id === paymasterId)
          ?.name;
    }
  },
  mounted() {
    this.fetchAccounts();
  },
  computed: {
    availableAccountTypes() {
      if (this.counterpartyStore.counterparty?.type === 'LSP') {
        return ['DISTRIBUTOR', 'CLIENT']
      }
      if (this.accounts.length === 0) {
        return ['ADMIN'];
      }
      return this.accountTypes;
    },
    availableWalletTypes() {
      if (this.accounts.length === 0) {
        return [
          {
            code: 'EOA', desc: 'Externally Owned Account'
          }];
      }
      return this.walletTypes;
    },
    filteredAccounts() {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) return this.accounts;
      return this.accounts.filter(acc =>
          (acc.name || '').toLowerCase().includes(query) ||
          (acc.externalId || '').toLowerCase().includes(query)
      );
    },
    onlyEoaAccounts() {
      return this.accounts.filter(acc =>
          (acc.walletType === 'EOA')
      );
    },
    hasErrors() {
      return !!this.errors.name;
    },
  }
}
</script>

<template>
  <h3 class="bold p-2 pt-3">Accounts</h3>
  <div class="p-2 mt-3">
    <div v-if="!showCreateForm" class="d-flex d-flex flex-column align-items-end mb-3">
      <button class="btn btn-outline-primary btn-sm" @click="showCreateForm = !showCreateForm">
        Create Account
      </button>
    </div>
    <form v-else @submit.prevent="createAccount" class="mb-4">
      <input
          v-model="form.name"
          class="form-control mb-2 w-50"
          placeholder="Account Name"
          @input="validateName"
          required
      />
      <div v-if="errors.name" class="form-text mb-2 text-danger">{{ errors.name }}</div>

      <AccountTypeSelect class="form-select mb-2 w-25"
          v-model="form.type"
          :account-types="availableAccountTypes"
      />
      <input
          v-model="form.externalId"
          class="form-control mb-2 w-50"
          placeholder="External ID (Optional)"
      />

      <select
          v-model="form.walletType"
          class="form-select mb-2 w-25"
          required
      >
        <option disabled value="">-- wallet type --</option>
        <option v-for="walletType in availableWalletTypes" :key="walletType.code" :value="walletType.code">
          {{ walletType.desc }}
        </option>
      </select>
      <!-- paymaster account -->
      <div class="mb-3" v-if="form.walletType === 'SMART'">
        <label class="form-label">Paymaster Account</label>
        <select v-model="form.paymasterId" class="form-select w-50" required>
          <option disabled value="">-- select paymaster --</option>
          <option v-for="acc in onlyEoaAccounts" :key="acc.id" :value="acc.id">
            {{ acc.name }}
          </option>
        </select>
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button
            class="btn btn-outline-danger btn-sm"
            type="button"
            @click="showCreateForm = false; clearForm()"
        >
          Cancel
        </button>
        <button class="btn btn-outline-primary btn-sm" type="submit" :disabled="hasErrors">
          Create Account
        </button>
      </div>
    </form>

    <div v-if="accounts && accounts.length > 0" class="my-3">
      <input
          type="text"
          class="form-control"
          v-model="searchQuery"
          placeholder="Search by Name or External Id"
      />
    </div>

    <div v-if="accounts && accounts.length > 0" class="pt-3">
      <table class="table table-bordered">
        <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">External Id</th>
          <th scope="col">Type</th>
          <th scope="col">Address</th>
          <th scope="col">Wallet Type</th>
          <th scope="col" style="width: 100px;">Transfers</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="acc in filteredAccounts" :key="acc.id">
          <td>
            <router-link :to="{ name: 'account-details', params: { id: acc.id } }"
                         class="">
              {{ acc.name }}
            </router-link>
          </td>
          <td class="mono">{{ acc.externalId }}</td>
          <td class="mono">{{ acc.type }}</td>
          <td>
            <addr-scan-link :type="'account'" :address="acc.address"></addr-scan-link>
          </td>
          <td class="mono">
            {{ acc.walletType }}
            <div v-if="acc.paymasterId">Master Account: {{ findMasterAccName(acc.paymasterId) }}</div>
          </td>
          <td>
            <router-link v-if="acc.transfersTotal" :to="{ name: 'account-transfers', params: { accountId: acc.id } }"
                         class="">
              Transfers ({{ acc.transfersTotal }})
            </router-link>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">No accounts created yet. Please create.</div>
  </div>

  <InfoToast
      v-if="success"
      :message="success"
      @closed="success = null;"
  />
  <ErrorToast
      v-if="error"
      :error="error"
      @closed="error = null"
  />

</template>

<style scoped>

</style>
