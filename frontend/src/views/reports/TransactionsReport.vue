<template>
  <div class="py-2">
    <h5>Отчёт по оплате</h5>
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
      <b-col class="text-center"><b-icon icon="square-fill" variant="success" /><br/><small>пополнения</small></b-col>
      <b-col class="text-center"><b-icon icon="square-fill" variant="warning" /><br/><small>платежи</small></b-col>
    </b-row>
    <div 
      v-for="(transactionSum, index) in transactionSums"
      :key="'transactionSum'+index" class="row mb-1 scrollable">
      <div class="col-sm-2"><small>{{ transactionSum.name }}:</small></div>
      <div class="col-sm-10 pt-1">
        <b-progress :max="maxIncomesSum">
          <b-progress-bar :value="transactionSum.incomesSum" :label="`${transactionSum.incomesSum}`" variant="success"></b-progress-bar>
        </b-progress>
        <b-progress :max="maxPaymentsSum">
          <b-progress-bar :value="transactionSum.paymentsSum" :label="`${transactionSum.paymentsSum}`" variant="warning"></b-progress-bar>
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
      transactionSums: [],
      selectedYear: new Date().getFullYear(),
      years: this.$getYears(),
      selectedMonth: new Date().getMonth(),
      months: this.$moment.months().map((m, i) => { return { value: i, text: m } }),
    }
  },
  computed: {
    maxIncomesSum() {
      let maxIncomesSum = 0;
      this.transactionSums.forEach(i => {
        maxIncomesSum  = maxIncomesSum > i.incomesSum ? maxIncomesSum : i.incomesSum;
      });
      return maxIncomesSum;
    },
    maxPaymentsSum() {
      let maxPaymentsSum = 0;
      this.transactionSums.forEach(i => {
        maxPaymentsSum  = maxPaymentsSum > i.paymentsSum ? maxPaymentsSum : i.paymentsSum;
      });
      return maxPaymentsSum;
    },
  },
  async mounted() {
    await this.fetchInfo();
  },
  methods: {
    async fetchInfo() {
      const info = await this.$getAsync(`${this.baseUrl}/transactions`, {
        month: this.selectedMonth,
        year: this.selectedYear,
      });
      this.transactionSums = info.transactionSums;
    },
    async exportData(){
      await this.$getAsync(`${this.baseUrl}/export-transactions`, {
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