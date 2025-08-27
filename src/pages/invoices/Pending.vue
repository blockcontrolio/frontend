<script>
import {formatDate, shortenString} from "../../js/utils.js";
import {fetchInvoicesForPayer} from "../../services/invoices-api.js";

export default {
  data() {
    return {
      invoices: [],
      loading: true,
      error: null
    }
  },
  methods: {
    formatDate,
    shortenString,
    async loadInvoices() {
      try {
        const res = await fetchInvoicesForPayer();
        this.invoices = await res.json();
      } catch (err) {
        this.error = "Failed to load invoices";
        console.error(err);
      } finally {
        this.loading = false;
      }
    },
  },
  mounted() {
    this.loadInvoices();
  }
}
</script>

<template>

  <div>
    <h3 class="mb-4 text-center">Pending Invoices</h3>
    <div v-if="loading">Loading…</div>
    <div v-else-if="error" class="text-danger">{{ error }}</div>
    <table v-else class="table-hover align-middle">
      <tbody>
      <tr
          v-for="invoice in invoices"
          :key="invoice.invoiceId"
          style="cursor: pointer;"
      >
        <td>
          <router-link
              class="text-decoration-none"
              :to="`/invoices/${invoice.invoiceId}`"
          >
            <span>{{ shortenString(invoice.invoiceId) }}</span>
          </router-link>
        </td>
        <td class="d-flex justify-content-between align-items-center gap-3">
          <span>{{ shortenString(invoice.receiverCounterparty?.name) }}</span>
          <div>
            <strong>{{ invoice.amount }}</strong>
            {{ invoice.asset?.name }} ({{ invoice.asset?.symbol }})
          </div>
          <small class="text-muted">
            {{ formatDate(invoice.requestedAt) }}
          </small>
        </td>
      </tr>
      </tbody>
    </table>

  </div>
</template>
