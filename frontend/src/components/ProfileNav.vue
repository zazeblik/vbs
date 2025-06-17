<template>
  <b-navbar-nav class="ml-auto">
    <b-nav-form v-if="!isAuthShown">
      <b-nav-item-dropdown v-if="$isAuthenticated" text="Профиль" right>
        <template slot="button-content">
          <b-icon icon="person-circle" />
          {{$user.login}}
        </template>
        <b-dropdown-item v-if="isSiteShown && $user.role != 0" href="/cp">Панель управления</b-dropdown-item>
        <b-dropdown-item v-if="!isSiteShown && $user.role == 2" href="/cp/customization">Настройки</b-dropdown-item>
        <b-dropdown-item href="/auth/logout">Выйти</b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item v-else to="/auth">
        <b-icon icon="box-arrow-in-right" />
        Войти
      </b-nav-item>
    </b-nav-form>
  </b-navbar-nav>
</template>

<script>
export default {
  props: ['isAuthShown', 'isSiteShown']
};
</script>