<template>
  <div id="app" class="no-scroll">
    <Header 
      :isAuthShown="isAuthShown"
      :isControlPanelShown="isControlPanelShown" />
    <router-view />
  </div>
</template>

<script>
import Header from './components/Header'
export default {
  name: 'app',
  data() {
    return {
      isAuthShown: false,
      isControlPanelShown: false
    }
  },
  components: {
    Header
  },
  computed: {
    isSiteShown() {
      return !this.isAuthShown && !this.isControlPanelShown;
    }
  },
  methods: {
    showHomeHeader() {
      this.isAuthShown = false;
      this.isControlPanelShown = false;
    }
  },
  watch: {
    isAuthShown: function (val) {
      if (val) this.isControlPanelShown = false;
    },
    isControlPanelShown: function (val) {
      if (val) this.isAuthShown = false;
    }
  }
}
</script>

<style scoped>
.no-scroll {
  overflow-y: hidden;
  height: 100vh;
}
</style>