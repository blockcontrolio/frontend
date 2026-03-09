<script>
export default {
  name: 'ContactsModal',
  emits: ['go-to-login', 'go-to-register'],
  methods: {
    goToLogin() {
      this.$emit('go-to-login');
    },
    register() {
      this.$emit('go-to-register');
    }
  }
};
</script>

<template>
  <div class="modal-backdrop d-flex align-items-center justify-content-center">
    <div class="modal-content-custom border p-3">
      <div class="modal-header border-bottom">
        <h5 class="modal-title">Demo Credentials Required</h5>
      </div>
      <div class="modal-body">
        <p class="my-3">
          This app is currently running in <strong>demo mode</strong>. To access full functionality, including live asset transfers, please log in with credentials.
        </p>
        <p class="mb-3 text-warning">
          <strong>Important:</strong> This demo is for testing purposes only. Do not transfer significant real assets. The developers are not responsible for any loss of funds.
        </p>
        <p class="mb-3">
          For safe usage, we recommend requesting a <strong>demo</strong> login credentials, or proceed with your personal onboarding info.
        </p>
      </div>
      <div class="modal-footer border-top pt-3 gap-3">
        <button class="btn btn-outline-primary btn-sm" @click="register">
          Register
        </button>
        <button class="btn btn-outline-primary btn-sm" @click="goToLogin">
          Go to Login
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: var(--color-bg-body);
  backdrop-filter: blur(4px);
}

.modal-content-custom {
  background: var(--color-bg-body);
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
}
</style>
