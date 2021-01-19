<template>
  <div class="py-2">
    <h5>Отчёт по активности</h5>
    <b-input-group size="sm" prepend="Месяц">
      <b-form-select v-model="selectedMonth" :options="months" @change="fetchInfo()" />
      <b-form-select v-model="selectedYear" :options="years" @change="fetchInfo()" />
      <div class="type-label px-2 py-1" is-text>Тип</div>
      <b-form-select class="col-2" v-model="selectedActivityType" :options="activityTypes" @change="fetchInfo()"/>
      <b-input-group-append>
        <b-button variant="outline-success" @click="exportData">
          <b-icon icon="file-earmark-arrow-down"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Экспорт</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-list-group>
      <b-list-group-item
        class="person-row"
        v-for="(person, index) in persons"
        :key="'person_'+index">{{index + 1}}. {{person.name}}</b-list-group-item>
    </b-list-group>
  </div>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: '/reports',
      persons: [],
      selectedYear: new Date().getFullYear(),
      years: this.$getYears(),
      selectedMonth: new Date().getMonth(),
      selectedActivityType: 0,
      activityTypes: [{value: 0, text: 'активные'}, {value: 1, text: 'неактивные'}],
      months: this.$moment.months().map((m, i) => { return { value: i, text: m } }),
    }
  },
  async mounted() {
    await this.fetchInfo();
  },
  methods: {
    async fetchInfo() {
      const info = await this.$getAsync(`${this.baseUrl}/activity`, {
        month: this.selectedMonth,
        year: this.selectedYear,
        activity: this.selectedActivityType
      });
      this.persons = info.persons;
    },
    async exportData(){
      await this.$getAsync(`${this.baseUrl}/export-activity`, {
        month: this.selectedMonth,
        year: this.selectedYear,
        activity: this.selectedActivityType
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