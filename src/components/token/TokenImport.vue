<script>
export default {
  name: "TokenImport",
  props: {},
  data() {
    return {
      address: ""
    };
  },
  methods: {
    resetForms() {
      this.address = "";
    },
    submitImport() {
      this.$emit("import", this.address);
      this.resetForms();
    },
    cancel() {
      this.resetForms();
      this.$emit("cancel");
    },
  },
  emits: ['import', 'cancel']
};
</script>

<template>
  <form class="mb-4" @submit.prevent="submitImport">
    <input
        v-model="address"
        class="form-control"
        placeholder="Token hex address 0x..."
        pattern="^0x[a-fA-F0-9]{40}$"
        required
    />
    <div class="d-flex justify-content-end gap-2 mt-2">
      <button class="btn btn-outline-danger btn-sm" type="button" @click="cancel">
        Cancel
      </button>
      <button class="btn btn-outline-warning btn-sm" type="submit">
        Add Token
      </button>
    </div>
  </form>
</template>
