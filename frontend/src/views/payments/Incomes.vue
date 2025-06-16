<template>
  <div class="py-2">
    <h5>Журнал поступлений</h5>
    <b-input-group size="sm" prepend="Период">
      <b-form-datepicker
        placeholder="Дата начала"
        show-decade-nav
        :date-format-options="{ day: '2-digit', month: '2-digit', year: 'numeric'  }"
        value-as-date
        :start-weekday="1"
        v-model="fromDate"
        @hidden="fetchTable"
      />
      <b-form-datepicker
        placeholder="Дата конца"
        show-decade-nav
        :date-format-options="{ day: '2-digit', month: '2-digit', year: 'numeric'  }"
        value-as-date
        :start-weekday="1"
        v-model="toDate"
        @hidden="fetchTable"
      />
      <b-input-group-append>
        <b-button variant="outline-success" @click="exportData">
          <b-icon icon="file-earmark-arrow-down"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Экспорт</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-table class="py-2 incomes-table" small bordered sort-icon-left responsive :fields="fields" :items="incomes" foot-clone foot-variant="light" no-footer-sorting>
      <template v-slot:foot()="data">
        <b v-if="data.column == 'description'">{{'Итого: ' + total}}</b>
        <b v-else-if="data.column == 'createdAt'">{{'Итого наличными: ' + totalCash}}</b>
        <b v-else-if="data.column == 'person.name'">{{'Итого безналично: ' + totalElectronic}}</b>
        <b v-else-if="data.column == 'sum'">{{'Итого других: ' + totalOther}}</b>
        <b v-else></b>
      </template>
    </b-table>
  </div>
</template>

<script>
const IncomeType = require("../../../../enums").IncomeType;
export default {
  data() {
    return {
      baseUrl: '/incomes',
      fromDate: new Date(),
      toDate: new Date(),
      fields: [
        { key: 'createdAt', label: 'Дата создания', sortable: true, formatter: (value, key, item) => this.$moment(value).format("DD.MM.YYYY HH:mm") },
        { key: 'person.name', label: 'Плательщик', sortable: true },
        { key: 'sum', label: 'Сумма', sortable: true },
        { key: 'type', label: 'Тип начисления', sortable: true, formatter: (value, key, item) => {
          switch(value) {
            case IncomeType.Electronic: return "безналичный";
            case IncomeType.Cash: return "наличный";
            case IncomeType.Other: return "другой";
          }
        } },
        { key: 'description', label: 'Описание', sortable: true }
      ],
      incomes: [],
      total: 0,
      totalElectronic: 0,
      totalCash: 0,
      totalOther: 0,
    }
  },
  async mounted() {
    await this.fetchTable();
  },
  methods: {
    async fetchTable() {
      this.incomes = await this.$getAsync(`${this.baseUrl}/report`, {
        fromDate: this.$moment(this.fromDate).startOf('day').valueOf(),
        toDate: this.$moment(this.toDate).endOf('day').valueOf(),
      });
      this.total = this.incomes.sum(x => x.sum);
      this.totalElectronic = this.incomes.filter(x => x.type == IncomeType.Electronic).sum(x => x.sum);
      this.totalCash = this.incomes.filter(x => x.type == IncomeType.Cash).sum(x => x.sum);
      this.totalOther = this.incomes.filter(x => x.type == IncomeType.Other).sum(x => x.sum);
    },
    async exportData() {
      await this.$getAsync(`${this.baseUrl}/export`, {
        fromDate: this.$moment(this.fromDate).startOf('day').valueOf(),
        toDate: this.$moment(this.toDate).endOf('day').valueOf(),
      }, true);
    }
  }
}
</script>

<style scoped>
.incomes-table {
  font-size: small !important;
  overflow-y: auto;
  height: calc(100vh - 135px);
}
</style>