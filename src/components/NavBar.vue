<script>
export default {
  name: "NavBar.vue"
}
</script>

<template>
  <div class="sidebar">
    <h4>BlockControl</h4>
    <router-link to="/">Dashboard</router-link>
    <router-link to="/transfer">Asset Transfer</router-link>
    <router-link to="/accounts">Accounts</router-link>
    <router-link to="/transactions">Transactions</router-link>
    <router-link to="/settings">Settings</router-link>
  </div>
</template>
<style scoped>

</style>