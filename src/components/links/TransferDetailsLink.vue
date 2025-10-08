<script>

export default {
  name: "TransferDetailsLink",
  props: ['transferId', 'short'],
  setup() {
  },
  methods: {
    shortenString() {
      return this.transferId.substring(0, 6) + '...' + this.transferId.substring(this.transferId.length - 4);
    },
  }
}
</script>

<template>
  <router-link class="text-nowrap" :to="{ name: 'transfer-details', params: { transferId: this.transferId } }">
    <code>{{ this.short ? shortenString() : this.transferId }}</code>
  </router-link>
</template>

<style scoped>

</style>