<script>
export default {
  name: 'FromAccountSelector',
  props: {
    modelValue: String, // selected account ID
    accounts: Array,
    label: {
      type: String,
      default: 'From Account'
    },
    placeholder: {
      type: String,
      default: '-- source account --'
    },
    required: {
      type: Boolean,
      default: true
    },
    selectedAsset: Object // optional
  },
  emits: ['update:modelValue', 'change'],
  methods: {
    onChange(newVal) {
      this.$emit('update:modelValue', newVal);
      this.$emit('change', newVal);
    },
    formatAmount(val) {
      return parseFloat(val).toLocaleString(undefined, {maximumFractionDigits: 6});
    }
  }
};
</script>

<template>
  <div class="mb-3">
    <label class="form-label">{{ label }}</label>
    <select
        class="form-select"
        :required="required"
        :value="modelValue"
        @change="onChange($event.target.value)"
    >
      <option disabled value="">{{ placeholder }}</option>
      <option v-for="acc in accounts" :key="acc.id" :value="acc.id">
        {{ acc.name || '(Unnamed)' }} — {{ acc.ref }}
      </option>
    </select>

    <div v-if="modelValue && selectedAsset" class="mt-1 balance">
      <span class="small label me-2">Balance:</span>
      <span class="value">{{ formatAmount(selectedAsset.amount) }} {{ selectedAsset.symbol }}</span>
    </div>
  </div>
</template>
