<template>
  <b-container class="py-2">
    <h5>Прайс лист</h5>
    <b-table striped :items="items" :fields="fields"></b-table>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: '/site',
      fields: [
        { key: "name", label: "Группа" }, 
        { key: "cost", label: "Месячный абонимент" }, 
        { key: "onceCost", label: "Разовый платёж" } 
      ],
      items: [],
    };
  },
  async mounted() {
    this.items = await this.$getAsync(`${this.baseUrl}/groups`);
  },
};
</script>