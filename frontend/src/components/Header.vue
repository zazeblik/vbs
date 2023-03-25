<template>
  <div>
    <b-navbar v-if="isSiteShown" toggleable="lg" class="shadow bg-white">
      <b-container>
        <div class="brand-block">
          <div>
            <b-navbar-brand to="/">ERP</b-navbar-brand>
            <br>
            <small>Решение для спортивных секций, танцевальных студий, учебных и фитнес-центров</small>
          </div>
        </div>
        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
        <b-collapse id="nav-collapse" is-nav>
          <ProfileNav :isAuthShown="isAuthShown" :isSiteShown="isSiteShown" />
        </b-collapse>
      </b-container>
    </b-navbar>
    <b-navbar v-else toggleable="lg" type="dark" variant="dark">
      <b-navbar-brand :to="isControlPanelShown ? '/cp' : '/'">ERP</b-navbar-brand>
      <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>
      <b-collapse id="nav-collapse" is-nav>
        <ControlPanelNav v-if="isControlPanelShown" class="d-md-block d-lg-none" />
        <ProfileNav :isAuthShown="isAuthShown" :isSiteShown="isSiteShown" />
      </b-collapse>
    </b-navbar>
  </div>
</template>

<script>
import ProfileNav from './ProfileNav'
import ControlPanelNav from './ControlPanelNav'
export default {
  components: {
    ProfileNav,
    ControlPanelNav
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