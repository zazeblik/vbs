<template>
  <b-container fluid>
    <b-row class="cp-page">
      <b-col lg="2" class="d-none d-lg-block bg-dark px-0">
        <ControlPanelNav />
      </b-col>
      <b-col>
        <router-view />
      </b-col>
    </b-row>
  </b-container>
</template>

<script>
import ControlPanelNav from '../components/ControlPanelNav'
export default {
  components: {
    ControlPanelNav
  },
  beforeCreate(){
    this.$parent.isControlPanelShown = true
  }
}
</script>

<style scoped>
.cp-page {
  min-height: calc(100vh - 1rem - 40px);
}
</style>