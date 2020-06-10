<template>
  <div>
    <b-navbar toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand to="/cp" v-if="$isAuthenticated">CRM</b-navbar-brand>
      <b-navbar-brand to="/" v-else>CRM</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav v-if="isControlPanelShown">
          <b-nav-item-dropdown text="База данных">
            <b-dropdown-item to="/cp/persons">Участники</b-dropdown-item>
            <b-dropdown-item to="/cp/groups">Группы</b-dropdown-item>
            <b-dropdown-item to="/cp/places">Залы</b-dropdown-item>
            <b-dropdown-item to="/cp/archive">Архив</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item-dropdown text="Журналы">
            <b-dropdown-item to="/cp/generals">Общие</b-dropdown-item>
            <b-dropdown-item to="/cp/personals">Индивидуальные</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item to="/cp/payments">Оплата</b-nav-item>
        </b-navbar-nav>

        <!-- Right aligned nav items -->
        <b-navbar-nav class="ml-auto">
          <b-nav-form v-if="!isAuthShown">
            <b-nav-item-dropdown v-if="$isAuthenticated" text="Профиль" right>
              <template slot="button-content"> 
                <b-icon icon="people-circle" />
              </template>
              <b-dropdown-item href="/auth/logout">Выйти</b-dropdown-item>
            </b-nav-item-dropdown>
            <b-nav-item v-else to="/auth">Войти</b-nav-item>
          </b-nav-form>
        </b-navbar-nav>
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
export default {
  props: ['isAuthShown', 'isControlPanelShown']
};
</script>