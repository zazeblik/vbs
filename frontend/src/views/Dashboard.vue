<template>
  <b-container fluid class="py-2">
    <div class="alert alert-success py-2 px-3" v-if="birthdays.length">
      Сегодня день рождения отмечают:
      <ul class="mb-0">
        <li v-for="(birth, index) in birthdays" :key="'birth'+index">{{birth.name}} ({{getAge(birth.birthday)}} лет)</li>
      </ul>
    </div>
    <b-input-group size="sm" prepend="Месяц">
      <b-form-select v-model="selectedMonth" :options="months" @change="fetchInfo()" />
      <b-form-select v-model="selectedYear" :options="years" @change="fetchInfo()" />
      <b-input-group-append>
        <b-button variant="outline-success" @click="createMonthEvents()">
          <b-iconstack>
            <b-icon stacked icon="plus-circle-fill" shift-h="-4" shift-v="3" scale="0.6"></b-icon>
            <b-icon stacked icon="calendar" shift-h="0"></b-icon>
          </b-iconstack>
          &nbsp;
          <span class="d-none d-md-inline-block">Создать занятия на месяц</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-tabs fill small class="pt-2" lazy>
      <b-tab title="Расписание">
        <FullCalendar 
          defaultView="dayGridMonth" 
          :plugins="calendarPlugins" 
          ref="fullCalendar"
          :header="{left:'',center: '',right: ''}"
          locale="ru"
          :firstDay="1"
          height="auto"
          :events="calendarEvents"
        />
      </b-tab>
      <b-tab title="Посещения">
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
          v-for="(visit, index) in getVisits()"
          :key="'visit'+index" class="row mb-1">
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
      </b-tab>
      <b-tab title="Тренеры">
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
          v-for="(instructor, index) in getInstructors()"
          :key="'instructor'+index" class="row mb-1">
          <div class="col-sm-2"><small>{{ instructor.name }}:</small></div>
          <div class="col-sm-10 pt-1">
            <b-progress :max="maxInstructorsCount">
              <b-progress-bar :value="instructor.total" :label="`${instructor.total}`" variant="success"></b-progress-bar>
            </b-progress>
            <b-progress :max="maxInstructorsCount">
              <b-progress-bar :value="instructor.generalsCount" :label="`${instructor.generalsCount}`" variant="info"></b-progress-bar> 
              <b-progress-bar :value="instructor.personalsCount" :label="`${instructor.personalsCount}`" variant="warning"></b-progress-bar>
            </b-progress>
          </div>
        </div>
      </b-tab>
      <b-tab title="Оплата">
        <b-row>
          <b-col class="text-center"><b-icon icon="square-fill" variant="success" /><br/><small>пополнения</small></b-col>
          <b-col class="text-center"><b-icon icon="square-fill" variant="warning" /><br/><small>платежи</small></b-col>
        </b-row>
        <div 
          v-for="(transactionSum, index) in getTransactionSums()"
          :key="'transactionSum'+index" class="row mb-1">
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
      </b-tab>
      <b-tab title="Сводка">
        <b-table class="totals-table" striped hover :items="totals" :fields="totalsFields">
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
      </b-tab>
    </b-tabs>
  </b-container>
</template>

<script>
import FullCalendar from '@fullcalendar/vue';
import dayGridPlugin from '@fullcalendar/daygrid';
import { GroupType } from "../../../enums";

export default {
  components: {
    FullCalendar
  },
  data() {
    return {
      baseUrl: '/dashboard',
      events: [],
      payments: [],
      incomes: [],
      birthdays: [],
      selectedYear: new Date().getFullYear(),
      years: this.$getYears(),
      selectedMonth: new Date().getMonth(),
      months: this.$moment.months().map((m, i) => { return { value: i, text: m } }),
      calendarPlugins: [ dayGridPlugin ],
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
      ]
    }
  },
  computed: {
    calendarEvents() {
      return this.events.map(e => { 
        return {
          id: e.id,
          title: e.group.name,
          start: new Date(e.startsAt),
          end: new Date(e.startsAt + e.duration*60*1000),
          backgroundColor: e.place.color,
          borderColor: e.place.color,
          description: e.group.name
        }
      })
    },
    maxVisitsCount() {
      const visits = this.getVisits();
      let maxTotalCount = 0;
      visits.forEach(v => {
        maxTotalCount  = maxTotalCount > v.total ? maxTotalCount : v.total;
      });
      return maxTotalCount;
    },
    maxInstructorsCount() {
      const instructors = this.getInstructors();
      let maxTotalCount = 0;
      instructors.forEach(i => {
        maxTotalCount  = maxTotalCount > i.total ? maxTotalCount : i.total;
      });
      return maxTotalCount;
    },
    maxIncomesSum() {
      const transactionSums = this.getTransactionSums();
      let maxIncomesSum = 0;
      transactionSums.forEach(i => {
        maxIncomesSum  = maxIncomesSum > i.incomesSum ? maxIncomesSum : i.incomesSum;
      });
      return maxIncomesSum;
    },
    maxPaymentsSum() {
      const transactionSums = this.getTransactionSums();
      let maxPaymentsSum = 0;
      transactionSums.forEach(i => {
        maxPaymentsSum  = maxPaymentsSum > i.paymentsSum ? maxPaymentsSum : i.paymentsSum;
      });
      return maxPaymentsSum;
    },
    totals() {
      let groups = [...new Set(this.events.map(e => e.group.name))];
      let totals = groups.map(g => { 
        return {
          group: g, 
          eventsTotal: 0, 
          visitsTotal: 0, 
          paymentIds: [], 
          paymentsTotal: 0, 
          paymentsTotalSum: 0
        }
      });
      this.events.forEach(e => {
        let total = totals.find(t => t.group == e.group.name); 
        total.eventsTotal++;
        total.visitsTotal += e.visitors.length;
        e.payments.forEach(p => {
          if (total.paymentIds.includes(p.id)) return;
          total.paymentIds.push(p.id);
          total.paymentsTotal++;
          total.paymentsTotalSum += p.sum;
        });
      });
      return totals; 
    },
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
    await this.fetchBirthdays();
    await this.fetchInfo();
  },
  methods: {
    async fetchBirthdays() {
      this.birthdays = await this.$getAsync(`${this.baseUrl}/birthdays`);
    },
    async fetchInfo() {
      const info = await this.$getAsync(`${this.baseUrl}/month-info`, {
        month: this.selectedMonth,
        year: this.selectedYear,
      });
      this.events = info.events;
      this.payments = info.payments;
      this.incomes = info.incomes;
      if (!this.$refs.fullCalendar) return;
      let calendarApi = this.$refs.fullCalendar.getApi();
      calendarApi.gotoDate(new Date(this.selectedYear, this.selectedMonth));
    },
    getAge(birthday) {
      var today = new Date();
      var birthDate = new Date(birthday);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
    },
    getInstructors(){
      let results = [];
      this.events.forEach(e => {
        let instructor = e.instructor;
        let finded = results.find(r => r.name == instructor.name);
        if (!finded) {
          results.push({name: instructor.name, generalsCount: 0, personalsCount: 0, total: 0});
          finded = results.find(r => r.name == instructor.name);
        }
        if (e.group.type == GroupType.General) {
          finded.generalsCount++;
        } else {
          finded.personalsCount++;
        }
        finded.total++;
      });
      return results.sort(this.sortByTotal);
    },
    getVisits(){
      let visits = [];
      this.events.forEach(e => {
        let visitors = e.visitors;
        visitors.forEach(v => {
          let finded = visits.find(visit => visit.name == v.name);
          if (!finded) {
            visits.push({name: v.name, generalsCount: 0, personalsCount: 0, total: 0});
            finded = visits.find(visit => visit.name == v.name);
          }
          if (e.group.type == GroupType.General) {
            finded.generalsCount++;
          } else {
            finded.personalsCount++;
          }
          finded.total++;
        })
      });
      return visits.sort(this.sortByTotal);
    },
    getTransactionSums() {
      let results = [];
      this.payments.forEach(x => {
        const person = x.person;
        let finded = results.find(r => r.name == person.name);
        if (!finded) {
          results.push({name: person.name, incomesSum: 0, paymentsSum: 0});
          finded = results.find(r => r.name == person.name);
        }
        finded.paymentsSum += x.sum;
      });
      this.incomes.forEach(x => {
        const person = x.person;
        let finded = results.find(r => r.name == person.name);
        if (!finded) {
          results.push({name: person.name, incomesSum: 0, paymentsSum: 0});
          finded = results.find(r => r.name == person.name);
        }
        finded.incomesSum += x.sum;
      });
      return results.sort(this.sortByIncomesSum);
    },
    sortByTotal(a, b) {
      if (a.total > b.total) return -1;
      if (a.total < b.total) return 1;
      return 0;
    },
    sortByIncomesSum(a, b) {
      if (a.incomesSum > b.incomesSum) return -1;
      if (a.incomesSum < b.incomesSum) return 1;
      return 0;
    },
    async createMonthEvents(){
      await this.$postAsync(`${this.baseUrl}/create-month-events`, {
        month: this.selectedMonth,
        year: this.selectedYear,
      });
      await this.fetchInfo();
    }
  }
};
</script>

<style lang='scss' scoped>

@import '~@fullcalendar/core/main.css';
@import '~@fullcalendar/daygrid/main.css';

.totals-table {
  font-size: small !important;
}

</style>