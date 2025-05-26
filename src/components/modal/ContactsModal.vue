<script>
export default {
  name: 'ContactsModal',
  props: {
    visible: Boolean
  },
  emits: ['go-to-settings'],
  methods: {
    goToSettings() {
      this.$emit('go-to-settings');
    }
  }
};
</script>

<template>
  <div
      class="modal-backdrop d-flex align-items-center justify-content-center"
      v-if="visible">
    <div class="modal-content-custom text-white border border-info p-3">
      <div class="modal-header border-bottom border-info">
        <h5 class="modal-title text-info">API Key Required</h5>
      </div>
      <div class="modal-body">
        <p class="mb-3">
          This app requires an API key to operate. Please request one to continue.
        </p>
        <ul class="list-unstyled">
          <li>
            <strong class="me-1">Email:</strong>
            <a href="mailto:blockcontrolio@gmail.com" class="text-info">blockcontrolio@gmail.com</a>
          </li>
          <li>
            <strong class="me-1">Telegram:</strong>
            <a href="https://t.me/web3yurii" target="_blank" class="text-info">@web3yurii</a>
          </li>
        </ul>
      </div>
      <div class="modal-footer border-top border-info pt-3">
        <button class="btn btn-outline-info" @click="goToSettings">
          Go to Settings
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
  background: linear-gradient(to bottom right, #000000ee, #0a0a0aee);
  backdrop-filter: blur(4px);
}

.modal-content-custom {
  background-color: #111;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
}
</style>
