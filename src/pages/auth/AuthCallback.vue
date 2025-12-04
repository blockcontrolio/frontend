<script>
import {clearStorage, saveTokens} from "../../auth/tokenService.js";
import {exchangeCodeForToken} from "../../auth/cognito.js";
import {useNetworkStore} from "../../js/stores/networkStore.js";
import {useCounterpartyStore} from "../../js/stores/counterpartyStore.js";
import {initStores} from "../../js/stores/initStores.js";

export default {
  setup() {
    const networkStore = useNetworkStore();
    const counterpartyStore = useCounterpartyStore();
    return {networkStore, counterpartyStore};
  },
  async mounted() {
    const code = this.$route.query.code;
    console.log("Code from Cognito:", code);
    const state = this.$route.query.state;

    if (!code) {
      console.error("No OAuth code found");
      return;
    }
    clearStorage();
    const tokens = await exchangeCodeForToken(code, state);
    saveTokens(tokens);
    window.dispatchEvent(new Event('auth-changed'));
    await initStores();
    // redirect to dashboard or onboarding
    if (this.counterpartyStore.isOnboarded) {
      this.$router.push("/dashboard");
    }
    this.$router.push("/onboarding");
  },
};
</script>

<template>
  <div class="p-3">Processing login...</div>
</template>
