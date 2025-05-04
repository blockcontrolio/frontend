<script setup>
import NavBar from './components/NavBar.vue'
</script>

<template>
  <div class="d-flex">
    <NavBar/>
    <div class="flex-fill p-4">
      <router-view/>
    </div>
  </div>
</template>

<style scoped>
</style>
