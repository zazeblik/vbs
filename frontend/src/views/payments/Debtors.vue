<template>
  <div class="py-2">
    <h5>Должники</h5>
    <b-input-group size="sm" prepend="Месяц">
      <b-form-select v-model="selectedMonth" :options="months" @change="fetchInfo()" />
      <b-form-select v-model="selectedYear" :options="years" @change="fetchInfo()" />
      <b-input-group-append>
        <b-button variant="outline-success" @click="exportData">
          <b-icon icon="file-earmark-arrow-down"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Экспорт</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-list-group>
      <b-list-group-item
        class="person-row"
        v-for="(person, index) in debtors"
        :key="'person_'+index">{{index + 1}}. {{person.name}}</b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: '/debtors',
      debtors: [],
      selectedYear: new Date().getFullYear(),
      years: this.$getYears(),
      selectedMonth: new Date().getMonth(),
      months: this.$moment.months().map((m, i) => { return { value: i, text: m } }),
    }
  },
  async mounted() {
    await this.fetchInfo();
  },
  methods: {
    async fetchInfo() {
      const info = await this.$getAsync(`${this.baseUrl}/list`, {
        month: this.selectedMonth,
        year: this.selectedYear
      });
      this.debtors = info.debtors;
    },
    async exportData(){
      await this.$getAsync(`${this.baseUrl}/export`, {
        month: this.selectedMonth,
        year: this.selectedYear
      }, true);
    }
  }
}
</script>

<style scoped>
.type-label {
  background: #e9ecef !important;
  font-size: small;
}
.person-row{
  padding: 0 0.5rem;
  font-size: small;
}
</style>