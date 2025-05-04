<script>
export default {
  data() {
    return {
      apiKey: localStorage.getItem('x-api-key') || ''
    }
  },
  methods: {
    save() {
      localStorage.setItem('x-api-key', this.apiKey);
      alert('API key saved');
    }
  }
}
</script>

<template>
  <div>
    <h3 class="mb-3">API Settings</h3>
    <input v-model="apiKey" class="form-control mb-2" placeholder="Enter x-api-key"/>
    <div class="d-flex justify-content-end mt-3">
      <button class="btn btn-success" @click="save">Save</button>
    </div>
  </div>
</template>
