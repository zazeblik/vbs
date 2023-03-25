<template>
  <div>
    <b-container class="pt-5">      
      <b-card class="mt-5" header="Авторизация">
        <b-form @submit="onSubmit">
          <b-form-group
            id="input-group-login"
            label="Логин:"
            label-for="input-login"
          >
            <b-form-input
              id="input-login"
              v-model="form.login"
              type="text"
              required
              placeholder="Введите логин"
            ></b-form-input>
          </b-form-group>

          <b-form-group
            id="input-group-password"
            label="Пароль:"
            label-for="input-password"
          >
            <b-form-input
              id="input-password"
              v-model="form.password"
              type="password"
              required
              placeholder="Введите пароль"
            ></b-form-input>
          </b-form-group>
          <b-button type="submit" variant="primary">Авторизоваться</b-button>
        </b-form>
      </b-card>
    </b-container> 
  </div>
</template>

<script>
import Vue from 'vue'
import { Role } from '../../../enums'
export default {
  data() {
    return {
      form: {
        login: '',
        password: ''
      }
    }
  },
  beforeCreate() {
    this.$parent.isAuthShown = true
  },
  methods: {
    async onSubmit(evt) {
      evt.preventDefault();
      const user = await this.$postAsync('/auth/login', this.form);
      if (!user)
        return;
      Vue.prototype.$user = user;
      Vue.prototype.$isAuthenticated = true;
      this.$router.push({name: 'dashboard'});
    }
  }
}
</script>