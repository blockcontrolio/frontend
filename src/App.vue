<script>
import NavBar from './components/NavBar.vue'
import ContactsModal from './components/modal/ContactsModal.vue';

export default {
  components: {ContactsModal, NavBar},
  data() {
    return {
      showModal: false
    };
  },
  mounted() {
    const apiKey = localStorage.getItem('x-api-key');
    this.showModal = !apiKey;
  },
  watch: {
    $route(to) {
      if (this.showModal && to.path !== '/settings') {
        this.$router.replace('/settings');
      }
    }
  },
  methods: {
    goToSettings() {
      this.showModal = false;
      this.$router.push('/settings');
    }
  }
}
</script>

<template>
  <div class="d-flex">
    <NavBar/>
    <div v-if="!showModal" class="flex-fill p-4">
      <router-view/>
    </div>
    <ContactsModal v-else :visible="showModal" @go-to-settings="goToSettings"/>
  </div>
</template>

<style scoped>
</style>
