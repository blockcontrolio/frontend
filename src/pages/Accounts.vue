<script>
import {useRouter} from "vue-router";
import {formatDate} from "../js/utils.js";

const API_URL = 'http://localhost:8080/api/v1/accounts';
const xApiKey = localStorage.getItem('x-api-key') || '';

export default {
  setup() {
    let router = useRouter();
    return {router}
  },
  data() {
    return {
      searchQuery: '',
      accounts: [],
      newAccount: {name: '', ref: ''},
      showCreateForm: false
    }
  },
  methods: {
    formatDate,
    async fetchAccounts() {
      const res = await fetch(API_URL, {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': xApiKey
        }
      });
      if (res.ok) {
        this.accounts = await res.json();
      }
    },
    async createAccount() {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': xApiKey
        },
        body: JSON.stringify(this.newAccount)
      });
      if (res.ok) {
        const added = await res.json();
        this.accounts.push({...added, show: false});
        this.newAccount = {ref: '', name: ''}; // clear inputs
        this.showCreateForm = false; // hide form
      } else {
        alert('Failed to create account');
      }
    },
  },
  mounted() {
    this.fetchAccounts();
  },
  computed: {
    filteredAccounts() {
      const query = this.searchQuery.toLowerCase().trim();
      if (!query) return this.accounts;
      return this.accounts.filter(acc =>
          (acc.name || '').toLowerCase().includes(query) ||
          (acc.ref || '').toLowerCase().includes(query) ||
          (acc.id || '').includes(query)
      );
    }
  }
}
</script>

<template>
  <div>
    <h3 class="mb-3">Accounts</h3>
    <div v-if="!showCreateForm" class="d-flex d-flex flex-column align-items-end mb-3">
      <button class="btn btn-outline-primary" @click="showCreateForm = !showCreateForm">
        Create Account
      </button>
    </div>
    <form v-else @submit.prevent="createAccount" class="mb-4">
      <input
          v-model="newAccount.name"
          class="form-control bg-dark text-white border-info mb-2"
          placeholder="Account Name"
      />
      <input
          v-model="newAccount.ref"
          class="form-control bg-dark text-white border-info mb-2"
          placeholder="Reference"
          required
      />
      <div class="d-flex justify-content-end gap-2">
        <button
            class="btn btn-outline-danger"
            type="button"
            @click="showCreateForm = false"
        >
          Cancel
        </button>
        <button class="btn btn-outline-primary" type="submit">
          Save Account
        </button>
      </div>
    </form>

    <div class="my-3">
      <input
          type="text"
          class="form-control text-white bg-dark border-info"
          v-model="searchQuery"
          placeholder="Search by name, ref or ID..."
      />
    </div>

    <div v-if="accounts && accounts.length > 0" class="pt-3">
      <table class="table table-dark table-hover table-bordered table-glow">
        <thead>
        <tr>
          <th scope="col">Name</th>
          <th scope="col">Ref</th>
          <th scope="col">Balance</th>
          <th scope="col">Account ID</th>
          <th scope="col">Created</th>
          <th scope="col" class="text-center">Status</th>
          <th scope="col" style="width: 100px;">Recent Transfers</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="acc in filteredAccounts" :key="acc.ref">
          <td>{{ acc.name || '(Unnamed)' }}</td>
          <td>{{ acc.ref }}</td>
          <td>{{ acc.balance }}</td>
          <td>
            <router-link :to="{ name: 'account-details', params: { id: acc.id } }"
                         class="text-info">
              {{ acc.id.substring(0, 6) }}…{{ acc.id.substring(acc.id.length - 4) }}
            </router-link>
          </td>
          <td>{{ formatDate(acc.createTime) }}</td>
          <td class="text-center">
            <span class="badge bg-success">Active</span>
          </td>
          <td>
            <router-link :to="{ name: 'Transfers', params: { accountId: acc.id } }"
                         class="text-info">
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
input.form-control.bg-dark.text-white::placeholder {
  color: #cccccc;
  opacity: 0.7;
}

input.form-control.bg-dark.text-white {
  color: #ffffff;
  border-color: #2af2ff;
}

input.form-control.bg-dark.text-white:focus {
  border-color: #2af2ff;
  box-shadow: 0 0 0 0.2rem rgba(42, 242, 255, 0.25);
}
</style>
