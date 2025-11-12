<script>
import {useRouter} from "vue-router";
import {addWebhook, fetchWebhooks, removeWebhook} from "../../services/api.js";
import InfoToast from "../../components/toast/InfoToast.vue";
import ErrorToast from "../../components/toast/ErrorToast.vue";

export default {
  components: {ErrorToast, InfoToast},
  setup() {
    let router = useRouter();
    return {router}
  },
  data() {
    return {
      webhooks: [],
      eventTypes: ['TRANSACTION_STATUS_UPDATED'],
      showForm: false,
      form: {
        eventType: "",
        callbackUrl: ""
      },
      error: "",
      messageSuccess: "",
      messageError: null
    }
  },
  methods: {
    async getWebhooks() {
      let res = await fetchWebhooks();
      this.webhooks = await res.json();
    },
    async sendAddWebhookRequest() {
      this.error = ""
      if (this.hasError) {
        return;
      }
      try {
        const response = await addWebhook(this.form);
        if (response.ok) {
          const added = await response.json();
          this.webhooks.push({...added, show: false});
          this.clearForm();
          this.showForm = false;
          this.messageSuccess = 'Webhook has been added';
        } else {
          const err = await response.json();
          this.handleError(err);
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    handleError(err) {
      const serverMsg = err.message || err.violations?.[0]?.message;
      this.messageError = {
        error: err.error || 'Error',
        message: serverMsg || 'Unknown error occurred.'
      };
    },
    handleUnknownError(err) {
      console.error(err)
      this.messageError = {
        error: 'Network Error',
        message: err.message
      };
    },
    clearForm() {
      this.form = {
        eventType: "",
        callbackUrl: ""
      }; // clear inputs
    },
    async remove(id) {
      try {
        const response = await removeWebhook(id);
        if (response.ok) {
          const index = this.webhooks.findIndex(w => w.id === id);
          if (index !== -1) {
            this.webhooks.splice(index, 1);
          }
        } else {
          const err = await response.json();
          this.handleError(err);
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
  },
  mounted() {
    this.getWebhooks();
  },
  computed: {
    emptyForm() {
      return !this.form.eventType ||
          !this.form.callbackUrl
    },
    hasError() {
      return !!this.error;
    },
    remainingEventTypes() {
      const used = new Set(this.webhooks.map(w => w.eventType));
      return this.eventTypes.filter(p => !used.has(p));
    },
  }
}
</script>

<template>
  <h3 class="bold p-2 pt-3">Webhooks</h3>
  <div class="p-2 mt-3">

    <div v-if="!showForm" class="d-flex d-flex flex-column align-items-end mb-3">
      <button class="btn btn-outline-primary btn-sm" @click="showForm = !showForm">
        Add Webhook
      </button>
    </div>

    <form v-else @submit.prevent="sendAddWebhookRequest" class="mb-4">

      <div v-if="remainingEventTypes.length > 0">
        <select class="form-select w-50 mb-2"
                v-model="form.eventType"
                required
        >
          <option disabled value="">-- event type --</option>
          <option
              v-for="type in remainingEventTypes"
              :key="type"
              :value="type"
          >
            {{ type }}
          </option>
        </select>

        <input
            v-model="form.callbackUrl"
            class="form-control mb-2 w-50"
            placeholder="Callback URL"
            type="url"
            required
            pattern="https?://.*"
            title="URL must start with http:// or https://"
        />

        <div v-if="error" class="form-text text-danger mb-2">{{ error }}</div>
      </div>
      <div v-else class="text-center text-danger mb-2">No more event types available</div>
      <div class="d-flex justify-content-end gap-2">
        <button
            class="btn btn-outline-danger btn-sm"
            type="button"
            @click="showForm = false; clearForm()"
        >
          Cancel
        </button>
        <button v-if="remainingEventTypes.length > 0" class="btn btn-outline-primary btn-sm" type="submit"
                :disabled="emptyForm">
          Add Webhook
        </button>
      </div>

    </form>

    <div v-if="webhooks && webhooks.length > 0" class="pt-3">
      <table class="table table-bordered">
        <thead>
        <tr>
          <th scope="col">Event Type</th>
          <th scope="col">Callback URL</th>
          <th scope="col">Actions</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="webhook in webhooks" :key="webhook.eventType">
          <td class="mono">{{ webhook.eventType }}</td>
          <td class="mono">{{ webhook.callbackUrl }}</td>
          <td class="d-flex justify-content-end gap-2">
            <button
                class="btn btn-outline-danger btn-sm"
                @click="remove(webhook.id)"
            >
              Remove
            </button>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="text-center">No webhooks yet created. Please create</div>
  </div>

  <InfoToast
      v-if="messageSuccess"
      :message="messageSuccess"
      @closed="messageSuccess = null;"
  />

  <ErrorToast
      v-if="messageError"
      :error="messageError"
      @closed="messageError = null;"
  />

</template>

<style scoped>

</style>
