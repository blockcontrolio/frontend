<script>
import {formatAmount} from "../../js/utils.js";

export default {
  name: 'AccountSelector',
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
    balance: Object // optional
  },
  emits: ['update:modelValue', 'change'],
  methods: {
    onChange(newVal) {
      this.$emit('update:modelValue', newVal);
      this.$emit('change', newVal);
    },
    formatAmount,
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
        {{ acc.name }}
      </option>
    </select>

    <div v-if="modelValue && balance" class="mt-1 balance">
      <span class="small label me-2">Balance:</span>
      <span class="value">{{ formatAmount(balance.amount) }} {{ balance.asset.symbol }}</span>
    </div>
  </div>
</template>
