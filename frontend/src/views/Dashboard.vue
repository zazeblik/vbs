<template>
  <div class="py-2">
    <div class="alert alert-success py-2 px-3" v-if="birthdays.length">
      Сегодня день рождения отмечают:
      <ul class="mb-0">
        <li v-for="(birth, index) in birthdays" :key="'birth'+index">{{birth.name}} ({{getAge(birth.birthday)}} лет)</li>
      </ul>
    </div>
    <h5>Расписание</h5>
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
    <FullCalendar 
      defaultView="dayGridMonth"
      class="pt-2"
      :plugins="calendarPlugins" 
      ref="fullCalendar"
      :header="{left:'',center: '',right: ''}"
      locale="ru"
      :firstDay="1"
      height="auto"
      :events="calendarEvents"
      @eventRender="eventRender"
    />
    <b-popover 
      v-for="(event, key) in events"
      :key="'event_popover_'+key" 
      :target="'event_'+event.id" 
      triggers="hover" 
      placement="top"
      :title="`${$moment(event.startsAt).format('HH:mm')} - ${$moment(new Date(event.startsAt + event.duration*60*1000)).format('HH:mm')}`">
      <b-list-group flush>
        <b-list-group-item><b>Группа:</b> {{event.group.name}}</b-list-group-item>
        <b-list-group-item><b>Тренер:</b> {{event.instructor.name}}</b-list-group-item>
        <b-list-group-item><b>Зал:</b> {{event.place.name}}</b-list-group-item>
        <b-list-group-item><b>Месячный абонимент:</b> {{event.group.cost}} р.</b-list-group-item>
        <b-list-group-item><b>Разовое занятие:</b> {{event.group.onceCost}} р.</b-list-group-item>
      </b-list-group>
    </b-popover>
  </div>
</template>

<script>
import FullCalendar from '@fullcalendar/vue';
import dayGridPlugin from '@fullcalendar/daygrid';

export default {
  components: {
    FullCalendar
  },
  data() {
    return {
      baseUrl: '/dashboard',
      events: [],
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
    async createMonthEvents(){
      await this.$postAsync(`${this.baseUrl}/create-month-events`, {
        month: this.selectedMonth,
        year: this.selectedYear,
      });
      await this.fetchInfo();
    },
    eventRender(info){
      info.el.id = "event_"+info.event.id;
      info.el.setAttribute('v-b-popover.hover.top','I am popover directive content!');
      info.el.setAttribute('title',`${this.$moment(info.event.start).format('HH:mm')}-${this.$moment(info.event.end).format('HH:mm')}  ${info.event.title}`);
    }
  }
};
</script>

<style lang='scss' scoped>

@import '~@fullcalendar/core/main.css';
@import '~@fullcalendar/daygrid/main.css';

</style>