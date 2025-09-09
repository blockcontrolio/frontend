<script>
import {useRouter} from "vue-router";
import {formatDate, validEmail, validPassword} from "../../js/utils.js";
import {addUser, assignPermission, fetchUsers, removePermission} from "../../services/api.js";
import UserRoleSelect from "../../components/UserRoleSelect.vue";
import InfoToast from "../../components/toast/InfoToast.vue";
import ErrorToast from "../../components/toast/ErrorToast.vue";

export default {
  components: {ErrorToast, InfoToast, UserRoleSelect},
  setup() {
    let router = useRouter();
    return {router}
  },
  data() {
    return {
      users: [],
      availablePermissions: ['ACCOUNT_MANAGE', 'TOKEN_MANAGE'],
      showUserForm: false,
      form: {
        email: "",
        password: "",
        confirmPassword: "",
        role: ""
      },
      error: "",
      messageSuccess: "",
      messageError: null
    }
  },
  methods: {
    formatDate,
    validEmail,
    validPassword,
    async getUsers() {
      let res = await fetchUsers();
      this.users = await res.json();
    },
    async sendNewUserRequest() {
      this.error = ""

      if (!this.validEmail(this.form.email)) {
        this.error = "Invalid email address"
        return
      }
      if (!this.validPassword(this.form.password)) {
        this.error = "Password must be at least 4 chars with upper, lower, and number"
        return
      }
      if (!this.passwordsMatch()) {
        this.error = "Passwords do not match"
        return
      }

      if (this.hasError) {
        return;
      }
      try {
        const response = await addUser(this.form);
        if (response.ok) {
          const added = await response.json();
          this.users.push({...added, show: false});
          this.clearForm();
          this.showUserForm = false;
          this.messageSuccess = 'User has been added';
        } else {
          const err = await response.json();
          this.handleError(err);
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    handleError(err) {
      this.messageError = {
        error: err.errorCode || 'Error',
        message: err.errorMessage || 'Unknown error occurred.'
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
        email: "",
        password: "",
        confirmPassword: "",
        role: ""
      }; // clear inputs
    },
    passwordsMatch() {
      return this.form.password === this.form.confirmPassword
    },
    openPermissionModal(user) {
      user.showPermissionDropdown = true
      user.newPermission = ""
    },
    async assignPermission(user) {
      if (!user.newPermission) {
        return
      }
      if (!user.permissions.includes(user.newPermission)) {
        try {
          const response = await assignPermission(user, user.newPermission);
          if (response.ok) {
            user.permissions.push(user.newPermission)
            user.showPermissionDropdown = false
            user.newPermission = ""
          } else {
            const err = await response.json();
            this.handleError(err);
          }
        } catch (err) {
          this.handleUnknownError(err);
        }
      }
    },
    cancelPermissionAssign(user) {
      user.showPermissionDropdown = false
      user.newPermission = ""
    },
    async removePermission(user, perm) {
      try {
        const response = await removePermission(user, perm);
        if (response.ok) {
          user.permissions = user.permissions.filter(p => p !== perm)
        } else {
          const err = await response.json();
          this.handleError(err);
        }
      } catch (err) {
        this.handleUnknownError(err);
      }
    },
    remainingPermissions(user) {
      return this.availablePermissions.filter(p => !user.permissions.includes(p))
    },
  },
  mounted() {
    this.getUsers();
  },
  computed: {
    emptyForm() {
      return !this.form.email ||
          !this.form.password ||
          !this.form.confirmPassword ||
          !this.form.role
    },
    hasError() {
      return !!this.error;
    },
  }
}
</script>

<template>
  <h3 class="bold p-2 pt-3">Users</h3>
  <div class="p-2 mt-3">

    <div v-if="!showUserForm" class="d-flex d-flex flex-column align-items-end mb-3">
      <button class="btn btn-outline-primary btn-sm" @click="showUserForm = !showUserForm">
        Add User
      </button>
    </div>

    <form v-else @submit.prevent="sendNewUserRequest" class="mb-4">
      <input
          v-model="form.email"
          class="form-control mb-2 w-50"
          placeholder="User's email"
          type="email" required
      />

      <UserRoleSelect class="form-select mb-2 w-25"
                      v-model="form.role"
      />

      <input v-model="form.password" type="password" class="form-control mb-2 w-50"
             placeholder="Password"
             required/>

      <input v-model="form.confirmPassword" type="password" class="form-control mb-2 w-50"
             placeholder="Confirm Password"
             required/>

      <div v-if="error" class="form-text text-danger mb-2">{{ error }}</div>

      <div class="d-flex justify-content-end gap-2">
        <button
            class="btn btn-outline-danger btn-sm"
            type="button"
            @click="showUserForm = false; clearForm()"
        >
          Cancel
        </button>
        <button class="btn btn-outline-primary btn-sm" type="submit" :disabled="emptyForm">
          Add User
        </button>
      </div>

    </form>

    <div v-if="users && users.length > 0" class="pt-3">
      <table class="table table-bordered">
        <thead>
        <tr>
          <th scope="col">Email</th>
          <th scope="col">Role</th>
          <th scope="col">Permissions</th>
          <th scope="col">Enabled</th>
          <th scope="col">Created At</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="user in users" :key="user.email">
          <td class="mono">{{ user.email }}</td>
          <td class="mono">{{ user.role }}</td>
          <td class="align-top" style="width: 315px">
            <!-- permission dropdown with Add/Cancel buttons -->
            <div v-if="user.showPermissionDropdown && remainingPermissions(user).length > 0"
                 class="mb-2">
              <div class="d-flex align-items-center gap-2">
                <select v-model="user.newPermission"
                        class="form-select form-select-sm w-auto">
                  <option disabled value="">-- select permission --</option>
                  <option v-for="perm in remainingPermissions(user)"
                          :key="perm"
                          :value="perm">
                    {{ perm }}
                  </option>
                </select>

                <!-- button group -->
                <div class="d-flex gap-1">
                  <button class="btn btn-sm btn-primary"
                          @click="assignPermission(user)">
                    Add
                  </button>
                  <button class="btn btn-sm btn-outline-secondary"
                          @click="cancelPermissionAssign(user)">
                    Cancel
                  </button>
                </div>
              </div>
            </div>

            <!-- assigned permissions as outlined chips -->
            <div class="d-flex flex-wrap align-items-center gap-1">
              <div v-for="perm in user.permissions"
                   :key="perm"
                   class="d-flex align-items-center border border-danger-subtle text-danger rounded-pill px-2 gap-1">
                {{ perm }}
                <button class="btn-close btn-sm ms-1 small"
                        style="width: 20px; height: 20px; line-height: 1;"
                        @click="removePermission(user, perm)"
                        aria-label="Remove"></button>
              </div>
              <!-- plus button (only shows if there are still assignable permissions) -->
              <button v-if="remainingPermissions(user).length > 0 && !user.showPermissionDropdown"
                      class="d-flex align-items-center justify-content-center btn btn-sm btn-outline-success rounded-circle"
                      style="width: 20px; height: 20px; line-height: 1;"
                      @click="openPermissionModal(user)">
                <i class="bi bi-plus-lg"></i>
              </button>
            </div>
          </td>
          <td class="mono">{{ user.enabled }}</td>
          <td>
            <small class="text-muted">{{ formatDate(user.createdAt) }}</small>
          </td>

        </tr>
        </tbody>
      </table>
    </div>
    <div v-else class="">No users yet. Please create</div>
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
