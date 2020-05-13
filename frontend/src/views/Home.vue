<template>
  <div>
    <b-container class="pt-3">
      <b-jumbotron header="CRM" lead="Облачный журнал учёта занятий и платежей">
        <div v-if="!$isAuthenticated">
          <p>Для того чтобы попасть в личный кабинет авторизуйтесь</p>
          <b-button variant="dark" to="/auth">Войти</b-button>
        </div>
      </b-jumbotron>
    </b-container>
  </div>
</template>
<script>
export default {
  beforeMount() {
    this.$parent.showHomeHeader()
  }
}
</script>