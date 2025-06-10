<script>
import {login} from "../../services/auth.js";
import {useCounterpartyStore} from "../../js/stores/counterpartyStore.js";
import {useNetworkStore} from "../../js/stores/networkStore.js";

export default {
  name: "LoginView",
  data() {
    return {
      credentials: {
        email: '',
        password: '',
      },
      error: null,
    };
  },
  methods: {
    async login() {
      const store = useCounterpartyStore();
      const networkStore = useNetworkStore();
      try {
        const response = await login(this.credentials);
        const contentType = response.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const data = isJson ? await response.json() : null;

        if (!response.ok) {
          this.error = data?.error || data?.message || response.statusText || "Login failed";
          return;
        }

        if (data?.token) {
          localStorage.setItem("auth-token", data.token);
          this.$router.push('/');
          await store.fetchCounterparty();
          networkStore.setNetwork(store.counterparty.networks[0]) // select network globally
        } else {
          this.error = "Token not received from server.";
        }
      } catch (err) {
        this.error = err.message || "Unexpected error occurred.";
      }
    }
  },
};
</script>

<template>
  <div class="container d-flex justify-content-center align-items-center vh-100">
    <div class="w-100" style="max-width: 420px;">
      <div class="card bg-dark text-light border-info p-4">
        <h3 class="text-center text-info mb-4">Sign In</h3>
        <form @submit.prevent="login">
          <div class="mb-3">
            <label for="email" class="form-label text-info">Email</label>
            <input v-model="credentials.email" type="email" class="form-control bg-black text-white border-info"
                   required>
          </div>
          <div class="mb-3">
            <label for="password" class="form-label text-info">Password</label>
            <input v-model="credentials.password" type="password" class="form-control bg-black text-white border-info"
                   required>
          </div>
          <button type="submit" class="btn btn-outline-info w-100">Log In</button>
        </form>
        <div v-if="error" class="text-danger mt-3">{{ error }}</div>
      </div>
    </div>
  </div>
</template>
