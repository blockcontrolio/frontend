<script>
import NavBar from './components/NavBar.vue'
import ContactsModal from './components/modal/ContactsModal.vue';

export default {
  components: {ContactsModal, NavBar},
  data() {
    return {
      showMissingApiKeyModal: false
    };
  },
  mounted() {
    const apiKey = localStorage.getItem('x-api-key');
    this.showMissingApiKeyModal = !apiKey;
  },
  watch: {
    $route(to) {
      if (this.showMissingApiKeyModal && to.path !== '/settings') {
        this.$router.replace('/settings');
      }
    }
  },
  methods: {
    openMissingApiKeyModal() {
      this.showMissingApiKeyModal = true;
    },
    closeApiKeyModal() {
      this.showMissingApiKeyModal = false;
    },
    goToSettings() {
      this.closeApiKeyModal();
      this.$router.push('/settings');
    }
  }
}
</script>

<template>
  <div class="d-flex">
    <NavBar @missing-api-key="openMissingApiKeyModal"/>
    <div v-if="!showMissingApiKeyModal" class="flex-fill p-4">
      <router-view/>
    </div>
    <ContactsModal v-else :visible="showMissingApiKeyModal" @go-to-settings="goToSettings"/>
  </div>
</template>

<style scoped>
</style>
