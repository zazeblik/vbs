<template>
  <div>
    <b-container fluid>
      <h4>Расписание на {{$moment(new Date()).format("MMMM YYYY")}}</h4>
      <FullCalendar
        :defaultView="$isMobile() ? 'dayGridWeek' : 'dayGridMonth'"
        :plugins="calendarPlugins" 
        ref="fullCalendar"
        :header="{left:'',center: '',right: ''}"
        locale="ru"
        height="auto"
        :firstDay="1"
        :events="calendarEvents"
        @eventRender="eventRender"
      />
    </b-container>
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
import PopOver from 'bootstrap-vue/src/components/popover/popover';

export default {
  components: {
    FullCalendar
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
  data() {
    return {
      baseUrl: "/site",
      events: [],
      selectedYear: new Date().getFullYear(),
      selectedMonth: new Date().getMonth(),
      calendarPlugins: [ dayGridPlugin ],
    }
  },
  async mounted() {
    await this.fetchInfo();
  },
  methods: {
    async fetchInfo() {
      this.events = await this.$getAsync(`${this.baseUrl}/self-schedule`, {
        month: this.selectedMonth,
        year: this.selectedYear,
      });
      if (!this.$refs.fullCalendar) return;
      let calendarApi = this.$refs.fullCalendar.getApi();
      calendarApi.gotoDate(new Date());
    },
    eventRender(info){
      info.el.id = "event_"+info.event.id;
      info.el.setAttribute('v-b-popover.hover.top','I am popover directive content!');
      info.el.setAttribute('title',`${this.$moment(info.event.start).format('HH:mm')}-${this.$moment(info.event.end).format('HH:mm')}  ${info.event.title}`);
    }
  }
}
</script>

<style lang='scss' scoped>
@import '~@fullcalendar/core/main.css';
@import '~@fullcalendar/daygrid/main.css';
</style>