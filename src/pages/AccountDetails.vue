<script>
import {formatDate} from "../js/utils.js";

const API_URL = 'http://localhost:8080/api/v1/accounts';
const xApiKey = localStorage.getItem('x-api-key') || '';

export default {
  data() {
    return {
      account: null,
    };
  },
  mounted() {
    const id = this.$route.params.id;
    if (!id || id === "undefined") {
      console.error("Invalid ID passed to fetch account");
      return;
    }
    this.fetchAccount(id);
  },
  methods: {
    formatDate,
    async fetchAccount(id) {
      try {
        const res = await fetch(`${API_URL}/${id}`, {
          headers: {
            'x-api-key': xApiKey,
          },
        });
        if (res.ok) {
          this.account = await res.json();
        } else {
          console.error('Failed to fetch account data');
        }
      } catch (error) {
        console.error('Error fetching account:', error);
      }
    },

    async updateAccount() {
      try {
        await fetch(`${API_URL}/${this.account.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': xApiKey,
          },
          body: JSON.stringify(this.account),
        });
        alert('Account updated!');
      } catch (error) {
        console.error('Error updating account:', error);
      }
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
        <div class="col-4"><strong>Balance:</strong></div>
        <div class="col-8">{{ account.balance }} ETH</div>
      </div>
      <div class="row mb-2">
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
