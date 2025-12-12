<script>
import {fetchApiKeys, generateApiKey, revokeApiKey} from "../services/api.js";

export default {
  name: "ApiKeyPanel",

  data() {
    return {
      apiKey: null,
      loading: false,
      actionLoading: false,
      error: null,
      show: false
    };
  },

  mounted() {
    this.loadApiKey();
  },

  methods: {

    maskedKey() {
      return "••••••••••••••••••••••••";
    },

    toggleShow() {
      this.show = !this.show;
    },

    async loadApiKey() {
      const activeKeys = await fetchApiKeys();
      const data = await activeKeys.json();
      this.apiKey = data[0];
    },
    async generate() {
      this.actionLoading = true;
      this.error = null;

      try {
        const res = await generateApiKey();

        const isJson = res.headers.get("content-type")?.includes("application/json");
        const data = isJson ? await res.json() : null;

        if (!res.ok) {
          this.error = data?.error || res.statusText || "Failed to regenerate key";
        }

        this.apiKey = data; // includes plaintext for display
      } catch (err) {
        this.error = err.message;
      } finally {
        this.actionLoading = false;
        this.show = true; // automatically show new key
      }
    },

    async revoke() {
      if (!confirm("Revoke this API key? It will stop working immediately!")) return;

      this.actionLoading = true;
      this.error = null;

      try {
        await revokeApiKey(this.apiKey.id);
        this.apiKey = null;
        this.show = false;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.actionLoading = false;
      }
    },

    copyToClipboard(text) {
      navigator.clipboard.writeText(text).catch(() => alert("Copy failed!"));
    }
  }
};
</script>

<template>
  <div>
    <!-- Loading -->
    <div v-if="loading" class="text-center py-3">
      <div class="spinner-border"></div>
    </div>

    <!-- Key Display -->
    <div v-if="!loading && apiKey">
      <label class="form-label">API Key</label>
      <div class="input-group mb-3">
        <input
            :type="show ? 'text' : 'password'"
            class="form-control"
            :value="apiKey.apiKey || maskedKey()"
            readonly
        />
        <button class="btn btn-outline-secondary" @click="toggleShow" :disabled="!apiKey.apiKey">
          <i :class="show ? 'bi bi-eye-slash' : 'bi bi-eye'"></i>
        </button>
        <button class="btn btn-outline-secondary" @click="copyToClipboard(apiKey.apiKey || maskedKey())" :disabled="!apiKey.apiKey">
          <i class="bi bi-clipboard"></i>
        </button>
      </div>

      <!-- Success -->
      <div v-if="apiKey.apiKey" class="alert alert-warning mt-2 small">
        This key is shown only once. Copy it now.
      </div>
      <!-- Error -->
      <div v-if="error" class="alert alert-danger mt-2 small">
        {{ error }}
      </div>

      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-outline-warning" @click="generate" :disabled="actionLoading">
          Regenerate
        </button>
        <button class="btn btn-sm btn-outline-danger" @click="revoke" :disabled="actionLoading">
          Revoke
        </button>
      </div>

    </div>

    <!-- No Key -->
    <div v-else-if="!loading && !apiKey">
      <p class="text-muted mb-2">No API key exists yet.</p>
      <div class="d-flex justify-content-end gap-2">
        <button class="btn btn-sm btn-primary" @click="generate" :disabled="actionLoading">
          Generate API Key
        </button>
      </div>
    </div>

  </div>

</template>

<style scoped>
</style>
