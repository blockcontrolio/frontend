<script>
export default {
  name: 'UserRoleSelect',
  props: {
    modelValue: {
      role: String,
      default: ''
    },
    roles: {
      type: Array,
      default: () => ['USER', 'ADMIN']
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
    <option disabled value="">-- user role --</option>
    <option
        v-for="role in roles"
        :key="role"
        :value="role"
    >
      {{ role }}
    </option>
  </select>
</template>
