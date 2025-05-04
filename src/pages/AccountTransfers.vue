<script>
import {formatDate} from "../js/utils.js";

const API_URL = 'http://localhost:8080/api/v1/transfers';
const xApiKey = localStorage.getItem('x-api-key') || '';

export default {
  name: 'Transfers',
  props: ['accountId'],
  data() {
    return {
      transfers: []
    };
  },
  mounted() {
    this.loadTransfers();
  },
  methods: {
    formatDate,
    async loadTransfers() {
      const res = await fetch(`${API_URL}?accountId=${this.accountId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': xApiKey
            }
          }
      );
      this.transfers = await res.json();
    },
    goBack() {
      this.$router.push('/accounts');
    },
  }
};
</script>

<template>
  <div>
    <h3 class="mb-3">Recent Transfers</h3>
    <!-- return to accounts list button -->
    <button
        class="btn btn-outline-secondary my-5"
        @click="goBack"
    >
      Return to List
    </button>
    <table class="table table-dark table-hover table-bordered table-glow">
      <thead class="text-white" style="background-color: #1a1f2b;">
      <tr>
        <th scope="col">To</th>
        <th scope="col">Amount</th>
        <th scope="col" class="text-center">Status</th>
        <th scope="col">Tx Hash</th>
        <th scope="col">Created</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="tx in transfers" :key="tx.txHash">
        <td>{{ tx.to }}</td>
        <td>{{ tx.amount }}</td>
        <td class="text-center">
          <span
              :class="{ 'bg-success': tx.status === 'SUCCESS', 'bg-warning text-dark': tx.status === 'PENDING', 'bg-danger': tx.status === 'FAILED' }">
            {{ tx.status }}
          </span>
        </td>
        <td>
          <code class="">
            {{ tx.txHash.slice(0, 10) }}...
          </code>
        </td>
        <td>
          {{ formatDate(tx.createTime) }}
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>

</style>