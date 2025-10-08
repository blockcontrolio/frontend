<script>

export default {
  name: "TxDetailsLink",
  props: ['transactionId', 'short'],
  setup() {
  },
  methods: {
    shortenString() {
      return this.transactionId.substring(0, 6) + '...' + this.transactionId.substring(this.transactionId.length - 4);
    },
  }
}
</script>

<template>
  <router-link class="text-nowrap" :to="{ name: 'transaction-details', params: { transactionId: this.transactionId } }">
    <code>{{ this.short ? shortenString() : this.transactionId }}</code>
  </router-link>
</template>

<style scoped>

</style>