<template>
  <div class="py-2">
    <h5>Отчёт по посещениям</h5>
    <b-input-group size="sm" prepend="Месяц">
      <b-form-select v-model="selectedMonth" :options="months" @change="fetchInfo()" />
      <b-form-select v-model="selectedYear" :options="years" @change="fetchInfo()" />
      <b-input-group-append>
        <b-button variant="outline-success" @click="exportData">
          <b-icon icon="file-earmark-arrow-down"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Экспорт</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-row>
      <b-col class="text-center"><b-icon icon="square-fill" variant="success" /><br/><small>всего</small></b-col>
      <b-col class="text-center"><b-icon icon="square-fill" variant="info" /><br/><small>общие</small></b-col>
      <b-col class="text-center">
        <b-icon icon="square-fill" variant="warning" />
        <br/>
        <span class="d-none d-sm-block"><small>индивидуальные</small></span>
        <span class="d-block d-sm-none"><small>индив.</small></span>
      </b-col>
    </b-row>
    <div 
      v-for="(visit, index) in visits"
      :key="'visit'+index" class="row mb-1 scrollable">
      <div class="col-sm-2"><small>{{ visit.name }}:</small></div>
      <div class="col-sm-10 pt-1">
        <b-progress :max="maxVisitsCount">
          <b-progress-bar :value="visit.total" :label="`${visit.total}`" variant="success"></b-progress-bar>
        </b-progress>
        <b-progress :max="maxVisitsCount">
          <b-progress-bar :value="visit.generalsCount" :label="`${visit.generalsCount}`" variant="info"></b-progress-bar> 
          <b-progress-bar :value="visit.personalsCount" :label="`${visit.personalsCount}`" variant="warning"></b-progress-bar>
        </b-progress>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: '/reports',
      visits: [],
      selectedYear: new Date().getFullYear(),
      years: this.$getYears(),
      selectedMonth: new Date().getMonth(),
      months: this.$moment.months().map((m, i) => { return { value: i, text: m } }),
    }
  },
  computed: {
    maxVisitsCount() {
      let maxTotalCount = 0;
      this.visits.forEach(v => {
        maxTotalCount  = maxTotalCount > v.total ? maxTotalCount : v.total;
      });
      return maxTotalCount;
    }
  },
  async mounted() {
    await this.fetchInfo();
  },
  methods: {
    async fetchInfo() {
      const info = await this.$getAsync(`${this.baseUrl}/visits`, {
        month: this.selectedMonth,
        year: this.selectedYear,
      });
      this.visits = info.visits;
    },
    async exportData(){
      await this.$getAsync(`${this.baseUrl}/export-visits`, {
        month: this.selectedMonth,
        year: this.selectedYear,
      }, true);
    }
  }
}
</script>

<style scoped>
.scrollable {
  overflow-y: auto;
  height: calc(100vh - 135px);
}
</style>