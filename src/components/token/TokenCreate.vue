<script>
export default {
  name: "TokenCreate",

  props: {
    visible: {
      type: Boolean,
      default: false
    },
    accounts: {
      type: Array,
      default: () => []
    },
  },

  data() {
    return {
      createForm: {
        name: "",
        symbol: "",
        deployerAccountId: "",
      },
    };
  },

  computed: {
    adminAccounts() {
      return this.accounts.filter((a) => a.type === "ADMIN");
    },
  },

  methods: {
    resetForm() {
      this.createForm = {name: "", symbol: "", deployerAccountId: ""};
    },
    cancel() {
      this.resetForm();
      this.$emit("cancel");
    },
    submitCreate() {
      this.$emit("create", {...this.createForm});
      this.resetForm();
    },
  },
  emits: ['create', 'cancel']
};
</script>

<template>
  <form class="mb-4" @submit.prevent="submitCreate">
    <input
        v-model="createForm.name"
        class="form-control mb-2 w-50"
        placeholder="Token Name"
        required
    />

    <input
        v-model="createForm.symbol"
        class="form-control mb-2 w-50"
        placeholder="Symbol"
        required
    />

    <div class="mb-3">
      <select
          v-model="createForm.deployerAccountId"
          class="form-select w-50"
          required
      >
        <option disabled value="">-- owner account --</option>
        <option
            v-for="acc in adminAccounts"
            :key="acc.ref"
            :value="acc.id"
        >
          {{ acc.name }}
        </option>
      </select>
    </div>

    <div class="d-flex justify-content-end gap-2">
      <button
          class="btn btn-outline-danger btn-sm"
          type="button"
          @click="cancel"
      >
        Cancel
      </button>
      <button class="btn btn-outline-warning btn-sm" type="submit">
        Create Token
      </button>
    </div>
  </form>
</template>
