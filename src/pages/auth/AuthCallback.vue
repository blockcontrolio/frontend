<script>
import {saveTokens} from "../../auth/tokenService.js";
import {exchangeCodeForToken} from "../../auth/cognito.js";

export default {
  async mounted() {
    const code = this.$route.query.code;
    console.log("Code from Cognito:", code);
    const state = this.$route.query.state;

    if (!code) {
      console.error("No OAuth code found");
      return;
    }

    const tokens = await exchangeCodeForToken(code, state);
    saveTokens(tokens);

    // redirect to dashboard or onboarding
    this.$router.push("/");
  },
};
</script>

<template>
  <div class="p-3">Processing login...</div>
</template>
