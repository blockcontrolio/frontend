<script>
import {useRouter} from "vue-router";
import {createAccount, fetchAccounts} from '../services/api'
import {formatDate} from "../js/utils.js";
import AddrScanLink from "../components/etherscan/AddrScanLink.vue";

export default {
  components: {AddrScanLink},
  setup() {
    let router = useRouter();
    return {router}
  },
  data() {
    return {
      accountTypes: ['ADMIN', 'ISSUER', 'DISTRIBUTOR', 'CLIENT', 'PAUSER', 'CUSTODIAN', 'LIMITER'],
      walletTypes: [
        {
          code: 'EOA', desc: 'Externally Owned Account'
        },
        {
          code: 'SMART', desc: 'Smart Contract Account'
        }],
      searchQuery: '',
      accounts: [],
      form: {name: '', ref: '', type: '', walletType: '', paymasterId: ''},
      showCreateForm: false,
      errors: {
        ref: ""
      },
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
      this.validateRef();
      if (this.hasErrors) return; // proceed with sending the transfer request using fetch
      const res = await createAccount(this.form);
      if (res.ok) {
        const added = await res.json();
        this.accounts.push({...added, show: false});
        this.clearForm();
        this.showCreateForm = false; // hide form
      } else {
        alert('Failed to create account');
      }
    },
    clearForm() {
      this.form = {ref: '', name: '', type: '', walletType: '', paymasterId: ''}; // clear inputs
    },
    validateRef() {
      if (this.form.ref.length < 4) {
        this.errors.ref = 'Ref must be unique and contain at least 4 letters or numbers';
      } else {
        this.errors.ref = '';
      }
    },
    resetError() {
      this.errors.ref = null;
    }
  },
  mounted() {
    this.fetchAccounts();
  },
  computed: {
    availableAccountTypes() {
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
          (acc.ref || '').toLowerCase().includes(query) ||
          (acc.id || '').includes(query)
      );
    },
    hasErrors() {
      return !!this.errors.ref;
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
          class="form-control mb-2"
          placeholder="Account Name"
      />
      <select
          v-model="form.type"
          class="form-select mb-2 w-25"
          required
      >
        <option disabled value="">-- account type --</option>
        <option v-for="accountType in availableAccountTypes" :key="accountType" :value="accountType">
          {{ accountType }}
        </option>
      </select>
      <input
          v-model="form.ref"
          class="form-control mb-2"
          placeholder="Reference"
          @input="validateRef"
          required
      />
      <div v-if="errors.ref" class="form-text mb-2">{{ errors.ref }}</div>

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
        <select v-model="form.paymasterId" class="form-select" required>
          <option disabled value="">-- select paymaster --</option>
          <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
            {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
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

    <div class="my-3">
      <input
          type="text"
          class="form-control"
          v-model="searchQuery"
          placeholder="Search by name, ref or ID..."
      />
    </div>

    <div v-if="accounts && accounts.length > 0" class="pt-3">
      <table class="table table-bordered">
        <thead>
        <tr>
          <th scope="col">Account ID</th>
          <th scope="col">Name</th>
          <th scope="col">Ref</th>
          <th scope="col">Type</th>
          <th scope="col">Address</th>
          <th scope="col">Create Time</th>
          <th scope="col" class="text-center">Status</th>
          <th scope="col" style="width: 100px;">Recent Transfers</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="acc in filteredAccounts" :key="acc.ref">
          <td>
            <router-link :to="{ name: 'account-details', params: { id: acc.id } }"
                         class="">
              {{ acc.id.substring(0, 6) }}…{{ acc.id.substring(acc.id.length - 4) }}
            </router-link>
          </td>
          <td>{{ acc.name || '(Unnamed)' }}</td>
          <td>{{ acc.ref }}</td>
          <td>{{ acc.type }}</td>
          <td>
            <addr-scan-link :type="'account'" :address="acc.address"></addr-scan-link>
          </td>
          <td>{{ formatDate(acc.createTime) }}</td>
          <td class="text-center">
            <span class="badge bg-success">Active</span>
          </td>
          <td>
            <router-link :to="{ name: 'Transfers', params: { accountId: acc.id } }"
                         class="">
              Transfers
            </router-link>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="">No accounts yet.</div>
  </div>
</template>

<style scoped>

</style>
