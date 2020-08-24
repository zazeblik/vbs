<template>
  <b-container class="py-2">
    <h5>Профиль</h5>
    <validation-observer ref="observer">
      <b-form>
        <validation-provider
          :name="loginLabel"
          :rules="{ required: true, min: 2 }"
          v-slot="validationContext"
        >
          <b-form-group label-cols-sm="3" label-size="sm" :label="loginLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$user.login"
              @change="save(validationContext, { login: $user.login })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_login">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider 
          :name="passwordLabel" 
          :rules="{ min: 8, regex: /^([A-Za-z0-9]+)$/ }" 
          v-slot="validationContext"
        >
          <b-form-group label-cols-sm="3" label-size="sm" :label="passwordLabel" class="mb-1">
            <b-form-input
              size="sm"
              type="password"
              v-model="password"
              @change="save(validationContext, { password })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_password">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
      </b-form>
    </validation-observer>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: "/site",
      loginLabel: "Логин",
      passwordLabel: "Пароль",
      password: null
    };
  },
  methods: {
    save(validationState, changes) {
      const state = this.getValidationState(validationState);
      if (state) {
        this.$postAsync(`${this.baseUrl}/profile`, changes);
      }
      return state;
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
  },
};
</script>