<script>
export default {
  name: 'AccountTypeSelect',
  props: {
    modelValue: {
      type: String,
      default: ''
    },
    accountTypes: {
      type: Array,
      default: () => ['ADMIN', 'ISSUER', 'OPERATOR', 'DISTRIBUTOR', 'CLIENT']
    },
  },
  computed: {
    internalValue: {
      get() {
        return this.modelValue;
      },
      set(val) {
        this.$emit('update:modelValue', val);
      }
    }
  }
};
</script>

<template>
  <select
      v-model="internalValue"
      required
  >
    <option disabled value="">-- account type --</option>
    <option
        v-for="type in accountTypes"
        :key="type"
        :value="type"
    >
      {{ type }}
    </option>
  </select>
</template>
