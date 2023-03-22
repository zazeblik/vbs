<template>
  <b-container>
    <b-row>
      <b-col md="8">
      </b-col>
      <b-col md="4">
      </b-col>
    </b-row>
  </b-container>
</template>

<script>

export default {
  components: {
  },
  methods: {
    
  },
  data() {
    return {
    };
  },
  beforeMount() {
    this.$parent.showHomeHeader();
  },
  async mounted() {},
};
</script>

<style scoped>
</style>