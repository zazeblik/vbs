<template>
  <div id="app">
    <Header 
      :settings="settings"
      :isAuthShown="isAuthShown"
      :isControlPanelShown="isControlPanelShown" />
    <router-view :class="isSiteShown ? 'mt-5 pt-5 site-page' : null" />
  </div>
</template>

<script>
import Header from './components/Header'
export default {
  name: 'app',
  data() {
    return {
      settings: null,
      baseUrl: "/site",
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
  async mounted(){
    this.settings = await this.$getAsync(`${this.baseUrl}/settings`);
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