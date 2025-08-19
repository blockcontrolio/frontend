<script>
export default {
  name: 'AmountInput',
  props: {
    modelValue: [String, Number],
    label: {
      type: String,
      default: 'Amount'
    },
    placeholder: {
      type: String,
      default: 'Amount to send'
    },
    selectedAsset: Object,
    validate: Function,
    errorMessage: String
  },
  emits: ['update:modelValue'],
  methods: {
    onInput(value) {
      this.$emit('update:modelValue', value);
      if (this.validate) {
        this.validate(value);
      }
    }
  }
};
</script>

<template>
  <div class="mb-3">
    <label class="form-label">{{ label }}</label>
    <input
        :value="modelValue"
        type="number"
        step="0.000000000000000001"
        class="form-control no-spinner"
        :placeholder="placeholder"
        @input="onInput($event.target.value)"
    />
    <div v-if="errorMessage" class="form-text text-danger">{{ errorMessage }}</div>

  </div>
</template>
