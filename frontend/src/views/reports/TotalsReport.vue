<template>
  <div class="py-2">
    <h5>Общая сводка</h5>
    <b-input-group size="sm" prepend="Месяц">
      <b-form-select v-model="selectedMonth" :options="months" @change="fetchInfo()" />
      <b-form-select v-model="selectedYear" :options="years" @change="fetchInfo()" />
      <b-input-group-append>
        <b-button variant="outline-success" @click="exportData">
          <b-icon icon="file-earmark-arrow-down"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Экспорт</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-table class="totals-table" responsive="sm" striped hover :items="totals" :fields="totalsFields">
      <template v-slot:custom-foot>
        <b-tr>
          <b-th>Итого</b-th>
          <b-th class="text-center">{{events.length}}</b-th>
          <b-th class="text-center">{{totalVisitsCount}}</b-th>
          <b-th class="text-center">{{totalPaymentsCount}}</b-th>
          <b-th class="text-center">{{totalPaymentsSum}}</b-th>
        </b-tr>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: '/reports',
      totals: [],
      events: [],
      totalsFields: [
        {
          key: 'group',
          label: 'Группа'
        },
        {
          key: 'eventsTotal',
          label: 'Занятий',
          class: 'text-center'
        },
        {
          key: 'visitsTotal',
          label: 'Посещений',
          class: 'text-center'
        },
        {
          key: 'paymentsTotal',
          label: 'Платежей',
          class: 'text-center'
        },
        {
          key: 'paymentsTotalSum',
          label: 'Сумма платежей',
          class: 'text-center'
        }
      ],
      selectedYear: new Date().getFullYear(),
      years: this.$getYears(),
      selectedMonth: new Date().getMonth(),
      months: this.$moment.months().map((m, i) => { return { value: i, text: m } }),
    }
  },
  computed: {
    totalVisitsCount() {
      let result = 0;
      this.events.forEach(e => {
        result += e.visitors.length;
      })
      return result;
    },
    totalPaymentsCount() {
      let result = 0;
      let paymentIds = [];
      this.events.forEach(e => {
        e.payments.forEach(p => {
          if (paymentIds.includes(p.id)) return;
          paymentIds.push(p.id);
          result++;
        })
      })
      return result;
    },
    totalPaymentsSum() {
      let result = 0;
      let paymentIds = [];
      this.events.forEach(e => {
        e.payments.forEach(p => {
          if (paymentIds.includes(p.id)) return;
          paymentIds.push(p.id);
          result+=p.sum;
        })
      })
      return result;
    }
  },
  async mounted() {
    await this.fetchInfo();
  },
  methods: {
    async fetchInfo() {
      const info = await this.$getAsync(`${this.baseUrl}/totals`, {
        month: this.selectedMonth,
        year: this.selectedYear,
      });
      this.totals = info.totals;
      this.events = info.events;
    },
    async exportData(){
      await this.$getAsync(`${this.baseUrl}/export-totals`, {
        month: this.selectedMonth,
        year: this.selectedYear,
      }, true);
    }
  }
}
</script>

<style scoped>
.totals-table {
  font-size: small !important;
  overflow-y: auto;
  height: calc(100vh - 135px);
}
</style>