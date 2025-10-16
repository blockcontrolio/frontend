<script>
export default {
  name: "TokenAdd",
  props: {
    partnerships: {
      type: Array,
      default: () => []
    },
  },
  data() {
    return {
      selectedCounterparty: "",
      tokenId: "",
    };
  },
  methods: {
    resetForms() {
      this.tokenId = "";
      this.selectedCounterparty = "";
    },
    submitAdd() {
      this.$emit("add", this.tokenId);
      this.resetForms();
    },
    cancel() {
      this.resetForms();
      this.$emit("cancel");
    },
  },
  computed: {
    findCounterpartyAssets() {
      return this.partnerships.find(p => p.id === this.selectedCounterparty)?.availableAssets;
    }
  },
  emits: ['add', 'cancel']
};
</script>

<template>
  <form @submit.prevent="submitAdd">
    <select
        v-model="selectedCounterparty"
        class="form-select mb-2 w-25"
        required
    >
      <option disabled value="">-- select counterparty --</option>
      <option
          v-for="counterparty in partnerships"
          :key="counterparty.id"
          :value="counterparty.id"
      >
        {{ counterparty.name }}
      </option>
    </select>

    <select
        v-if="selectedCounterparty"
        v-model="tokenId"
        class="form-select mb-2 w-25"
        required
    >
      <option disabled value="">-- select token --</option>
      <option
          v-for="token in findCounterpartyAssets"
          :key="token.id"
          :value="token.id"
      >
        {{ token.name }} ({{ token.symbol }})
      </option>
    </select>

    <div class="d-flex justify-content-end gap-2 mt-2">
      <button class="btn btn-outline-danger btn-sm" type="button" @click="cancel">
        Cancel
      </button>
      <button class="btn btn-outline-primary btn-sm" type="submit">
        Add Counterparty Token
      </button>
    </div>

  </form>

</template>
