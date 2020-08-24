<template>
  <div id="app">
    <Header 
      :isAuthShown="isAuthShown"
      :isControlPanelShown="isControlPanelShown" />
    <router-view :class="isSiteShown ? 'mt-5 pt-5 site-page' : null" />
    <SiteFooter v-if="isSiteShown" />
  </div>
</template>

<script>
import Header from './components/Header'
import SiteFooter from './components/SiteFooter'
export default {
  name: 'app',
  data() {
    return {
      isAuthShown: false,
      isControlPanelShown: false
    }
  },
  components: {
    Header,
    SiteFooter
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