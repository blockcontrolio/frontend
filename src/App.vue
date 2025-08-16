<script>
import NavBar from './components/NavBar.vue'
import ContactsModal from './components/modal/ContactsModal.vue';

export default {
  components: {ContactsModal, NavBar},
  data() {
    return {
      showContactsModal: false,
      showSidebar: false
    };
  },
  mounted() {
    this.checkAuth();
    // storage → built-in browser event, fires only when localStorage is changed from another tab/window.
    window.addEventListener('storage', this.checkAuth); // for multi-tab sync
    // auth-changed → custom event we emit manually after login/logout in the same tab.
    window.addEventListener('auth-changed', this.checkAuth); // sync in same tab
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.checkAuth);
    window.removeEventListener('auth-changed', this.checkAuth);
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
    },
    register() {
      this.closeModal();
      this.$router.push('/register');
    },
    checkAuth() {
      const authToken = localStorage.getItem('auth-token');
      this.showContactsModal = !authToken;
      this.showSidebar = !!authToken;
    }
  }
}
</script>

<template>
  <div class="d-flex">
    <NavBar v-if="showSidebar" @missing-jwt="openContactsModal"/>
    <ContactsModal v-else :visible="showContactsModal" @go-to-login="goToLogin" @proceed-onboarding="register"/>
    <div class="flex-fill p-4">
      <router-view/>
    </div>
  </div>
</template>

<style scoped>
</style>
