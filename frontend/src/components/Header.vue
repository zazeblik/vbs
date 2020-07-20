<template>
  <div>
    <b-navbar v-if="isSiteShown" toggleable="lg" class="fixed-top shadow bg-white">
      <div class="text-center brand-block">
        <div v-if="settings">
          <a class="navbar-brand" to="/" v-if="settings.logo"></a>
          <b-navbar-brand to="/" v-else>{{settings.name}}</b-navbar-brand>
          <br>
          <a class="header-logo-lext d-none d-lg-inline" v-if="isSiteShown && settings.subtitle">{{settings.subtitle}}</a>
        </div>
      </div>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <b-navbar-nav class="site-nav">
          <b-nav-item-dropdown id="siteNavDropdown" class="site-nav-item" text="О клубе">
            <b-dropdown-item to="/club">Наш клуб</b-dropdown-item>
            <b-dropdown-item to="/boss">Руководители</b-dropdown-item>
            <b-dropdown-item to="/places">Залы</b-dropdown-item>
            <b-dropdown-item to="/treners">Тренеры</b-dropdown-item>
            <b-dropdown-item to="/feedback">Отзывы</b-dropdown-item>
            <b-dropdown-item to="/schedule">Расписание</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item class="site-nav-item" to="/articles">Статьи</b-nav-item>
          <b-nav-item class="site-nav-item" to="/galery">Фото</b-nav-item>
          <b-nav-item class="site-nav-item" to="/tournaments">Турниры</b-nav-item>
        </b-navbar-nav>
        <ProfileNav :isAuthShown="isAuthShown" :isSiteShown="isSiteShown" />
      </b-collapse>
    </b-navbar>

    <b-navbar v-else toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand :to="isControlPanelShown ? '/cp' : '/'">CRM</b-navbar-brand>
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
          <b-nav-item-dropdown text="Сайт">
            <b-dropdown-item to="/cp/settings">Настройки</b-dropdown-item>
            <b-dropdown-item to="/cp/materials">Материалы</b-dropdown-item>
            <b-dropdown-item to="/cp/files">Документы</b-dropdown-item>
            <b-dropdown-item to="/cp/profiles">Учётные записи</b-dropdown-item>
          </b-nav-item-dropdown>
          <b-nav-item to="/cp/payments">Оплата</b-nav-item>
        </b-navbar-nav>
        <ProfileNav :isAuthShown="isAuthShown" :isSiteShown="isSiteShown" :settings="settings" />
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import ProfileNav from './ProfileNav'
export default {
  components: {
    ProfileNav
  },
  props: ['isAuthShown', 'isControlPanelShown', 'settings'],
  computed: {
    isSiteShown() {
      return !this.isAuthShown && !this.isControlPanelShown;
    }
  }
};
</script>

<style lang='scss' scoped>
.fixed-top{
  z-index: 1000;
}

.site-nav{
  display: flex;
  justify-content: space-evenly;
  width: -webkit-fill-available;
  max-width: 650px;
  margin: 0 auto;

  .site-nav-item {
    font-size: 1.3rem;
    color: var(--gray);
    font-weight: bold;
    text-transform: uppercase;
  }
}
</style>