<template>
  <div>
    <router-view />
  </div>
</template>

<script>
export default {
  beforeCreate(){
    this.$parent.isControlPanelShown = true
  }
}
</script>