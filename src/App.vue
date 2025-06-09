<script>
import NavBar from './components/NavBar.vue'
import ContactsModal from './components/modal/ContactsModal.vue';

export default {
  components: {ContactsModal, NavBar},
  data() {
    return {
      showContactsModal: false
    };
  },
  mounted() {
    const apiKey = localStorage.getItem('x-api-key');
    this.showContactsModal = !apiKey;
  },
  watch: {
    $route(to) {
      if (this.showContactsModal && to.path !== '/login') {
        this.$router.replace('/login');
      }
    }
  },
  methods: {
    openContactsModal() {
      this.showContactsModal = true;
    },
    closeModal() {
      this.showContactsModal = false;
    },
    goToLogin() {
      this.closeModal();
      this.$router.push('/login');
    }
  }
}
</script>

<template>
  <div class="d-flex">
    <NavBar @missing-jwt="openContactsModal"/>
    <div v-if="!showContactsModal" class="flex-fill p-4">
      <router-view/>
    </div>
    <ContactsModal v-else :visible="showContactsModal" @go-to-login="goToLogin"/>
  </div>
</template>

<style scoped>
</style>
