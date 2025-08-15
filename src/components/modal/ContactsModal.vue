<script>
export default {
  name: 'ContactsModal',
  props: {
    visible: Boolean
  },
  emits: ['go-to-login', 'proceed-onboarding'],
  methods: {
    goToLogin() {
      this.$emit('go-to-login');
    },
    proceedOnboarding() {
      this.$emit('proceed-onboarding');
    }
  }
};
</script>

<template>
  <div
      class="modal-backdrop d-flex align-items-center justify-content-center"
      v-if="visible">
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
        <ul class="list-unstyled">
          <li>
            <strong class="me-1">Email:</strong>
            <a href="mailto:yurii@blockcontrol.io" class="">yurii@blockcontrol.io</a>
          </li>
          <li>
            <strong class="me-1">Telegram:</strong>
            <a href="https://t.me/web3yurii" target="_blank" class="">@web3yurii</a>
          </li>
        </ul>
      </div>
      <div class="modal-footer border-top pt-3 gap-3">
        <button class="btn btn-outline-primary btn-sm" @click="proceedOnboarding">
          Onboarding
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
