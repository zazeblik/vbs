<template>
  <div class="py-2 calculation-table">
    <b-input-group size="sm" prepend="Месяц">
      <b-form-select v-model="selectedMonth" :options="months" @change="fetchInfo()" />
      <b-form-select v-model="selectedYear" :options="years" @change="fetchInfo()" />
      <b-input-group-append>
        <b-button variant="outline-success" @click="exportData">
          <b-icon icon="file-earmark-arrow-down"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Экспорт</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-table-simple class="py-2" small bordered responsive >
      <colgroup><col></colgroup>
      <colgroup><col><col><col><col></colgroup>
      <colgroup><col></colgroup>
      <b-thead>
        <b-tr>
          <b-th></b-th>
          <b-th colspan="6" variant="secondary" class="text-center">Группы</b-th>
          <b-th></b-th>
        </b-tr>
        <b-tr>
          <b-th class="text-center">Тренер</b-th>
          <b-th variant="secondary" class="text-center">Тип</b-th>
          <b-th variant="info" class="text-center">Название</b-th>
          <b-th variant="info" class="text-center">Занятий</b-th>
          <b-th variant="info" class="text-center">Правило</b-th>
          <b-th variant="info" class="text-center">Всего в группе</b-th>
          <b-th variant="secondary" class="text-center">Всего в типе групп</b-th>
          <b-th class="text-center">Всего</b-th>
        </b-tr>
      </b-thead>
      <b-tbody>
        <b-tr 
          v-for="row in tableRows"
          :key="row.instructor">
          <b-th 
            class="text-center" 
            v-if="row.instructor" 
            :rowspan="row.rowspan || 1">{{row.instructor}}</b-th>
          <b-th 
            class="text-center" 
            variant="secondary"
            v-if="row.type != null && row.type != undefined" 
            :rowspan="row.typeRowspan || 1">{{row.type}}</b-th>
          <b-td
            class="text-center">{{row.groupName ? row.groupName : "—"}}</b-td>
          <b-td
            class="text-center">{{row.eventsCount != undefined ? row.eventsCount : "—"}}</b-td>
          <b-td
            class="text-center">{{row.rule ? row.rule : "—"}}</b-td>
          <b-td
            class="text-center">{{row.sum != undefined ? row.sum : "—"}}</b-td>
          <b-td 
            class="text-center" 
            variant="secondary"
            v-if="row.typeSum != null && row.typeSum != undefined" 
            :rowspan="row.typeRowspan || 1">{{row.typeSum}}</b-td>
          <b-td 
            class="text-center" 
            v-if="row.totalSum != null && row.totalSum != undefined" 
            :rowspan="row.rowspan || 1">{{row.totalSum}}</b-td>
        </b-tr>
      </b-tbody>
      <b-tfoot>
        <b-tr>
          <b-td colspan="8" class="text-right">
            <b>Итого: {{total}}</b>
          </b-td>
        </b-tr>
      </b-tfoot>
    </b-table-simple>
  </div>
</template>

<script>
const GroupType = require("../../../../enums").GroupType;
const SalaryRuleType = require("../../../../enums").SalaryRuleType;
export default {
  data() {
    return {
      isBusy: false,
      baseUrl: '/salaryrules',
      selectedYear: new Date().getFullYear(),
      years: this.$getYears(),
      selectedMonth: new Date().getMonth(),
      months: this.$moment.months().map((m, i) => { return { value: i, text: m } }),
      calculations: [],
      total: 0
    }
  },
  computed: {
    tableRows() {
      let results = [];
      for (let i = 0; i < this.calculations.length; i++) {
        const calculation = this.calculations[i];
        for (let j = 0; j < calculation.types.length; j++) {
          const type = calculation.types[j];
          if (type.groups.length == 0){
            let result = {};
            result = this.fillTypeInfo(result, type);
            if (j == 0){
              result = this.fillCalculationInfo(result, calculation);
            }
            results.push(result);
            continue;
          } 
          for (let k = 0; k < type.groups.length; k++) {
            const group = type.groups[k];
            let result = {
              groupName: group.name,
              eventsCount: group.eventsCount,
              sum: group.sum,
              rule: this.getRule(group)
            };
            if (j == 0 && k == 0){
              result = this.fillCalculationInfo(result, calculation);
            }
            if (k == 0){
              result = this.fillTypeInfo(result, type);
            }
            results.push(result);
          }
        }
      }
      return results;
    }
  },
  async mounted() {
    await this.fetchInfo();
  },
  methods: {
    async fetchInfo() {
      this.calculations = await this.$getAsync(`${this.baseUrl}/calculations`, {
        month: this.selectedMonth,
        year: this.selectedYear,
      });
      this.total = this.calculations.sum(x => x.totalSum);
    },
    async exportData() {
      await this.$getAsync(`${this.baseUrl}/export-data`, {
        month: this.selectedMonth,
        year: this.selectedYear,
      }, true);
    },
    fillCalculationInfo(result, calculation){
      result.instructor = calculation.instructor;
      result.totalSum = calculation.totalSum;
      result.rowspan = this.getCalculationRowspan(calculation);
      return result;
    },
    fillTypeInfo(result, type){
      result.type = type.groupType == GroupType.General ? "Общие" : "Индивидуальные";
      result.typeSum = type.totalSum;
      result.typeRowspan = type.groups.length == 0 ? 1 : type.groups.length;
      return result;
    },
    getCalculationRowspan(calculation){
      let rowspan = 0;
      for (let i = 0; i < calculation.types.length; i++) {
        const type = calculation.types[i];
        rowspan += type.groups.length == 0 ? 1 : type.groups.length;
      }
      return rowspan;
    },
    getRule(group){
      const rule = group.rule;
      let adding = "";
      switch (rule.type) {
        case SalaryRuleType.Precentage:
          adding = "% от всех платежей"
          break;
        case SalaryRuleType.FixPerEvent:
          adding = " за каждое занятие с человека"
          break;
        case SalaryRuleType.FixMonthly:
          adding = " за месяц занятий в группе"
          break;
        default:
          console.log("Непонятное правило");
          break;
      }
      return `${rule.value}${adding}`;
    }
  }
}
</script>

<style scoped>
.calculation-table {
  font-size: small !important;
}
</style>