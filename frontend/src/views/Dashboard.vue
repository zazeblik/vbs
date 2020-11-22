<template>
  <div class="py-2">
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
        <b-button variant="outline-success" v-if="tabIndex == 0" @click="createMonthEvents()">
          <b-iconstack>
            <b-icon stacked icon="plus-circle-fill" shift-h="-4" shift-v="3" scale="0.6"></b-icon>
            <b-icon stacked icon="calendar" shift-h="0"></b-icon>
          </b-iconstack>
          &nbsp;
          <span class="d-none d-md-inline-block">Создать занятия на месяц</span>
        </b-button>
        <b-button v-else variant="outline-success" @click="exportData">
          <b-icon icon="file-earmark-arrow-down"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Экспорт</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-tabs v-model="tabIndex" fill small class="pt-2" lazy>
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
          v-for="(visit, index) in visits"
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
          v-for="(instructor, index) in instructors"
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
          v-for="(transactionSum, index) in transactionSums"
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
  </div>
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
      visits: [],
      instructors: [],
      transactionSums: [],
      totals: [],
      events: [],
      birthdays: [],
      tabIndex: 0,
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
      let maxTotalCount = 0;
      this.visits.forEach(v => {
        maxTotalCount  = maxTotalCount > v.total ? maxTotalCount : v.total;
      });
      return maxTotalCount;
    },
    maxInstructorsCount() {
      let maxTotalCount = 0;
      this.instructors.forEach(i => {
        maxTotalCount  = maxTotalCount > i.total ? maxTotalCount : i.total;
      });
      return maxTotalCount;
    },
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
      this.visits = info.visits;
      this.instructors = info.instructors;
      this.transactionSums = info.transactionSums;
      this.events = info.events;
      this.totals = info.totals;
      if (!this.$refs.fullCalendar) return;
      let calendarApi = this.$refs.fullCalendar.getApi();
      calendarApi.gotoDate(new Date(this.selectedYear, this.selectedMonth));
    },
    async exportData(){
      switch (this.tabIndex) {
        case 1:
          await this.$getAsync(`${this.baseUrl}/export-visits`, {
            month: this.selectedMonth,
            year: this.selectedYear,
          }, true);
          break;
        case 2:
          await this.$getAsync(`${this.baseUrl}/export-instructors`, {
            month: this.selectedMonth,
            year: this.selectedYear,
          }, true);
          break;
        case 3:
          await this.$getAsync(`${this.baseUrl}/export-payments`, {
            month: this.selectedMonth,
            year: this.selectedYear,
          }, true);
          break;
        case 4:
          await this.$getAsync(`${this.baseUrl}/export-totals`, {
            month: this.selectedMonth,
            year: this.selectedYear,
          }, true);
          break;
        default:
          break;
      }
    },
    getAge(birthday) {
      var today = new Date();
      var birthDate = new Date(birthday);
      var age = today.getFullYear() - birthDate.getFullYear();
      var m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) age--;
      return age;
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