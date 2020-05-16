<template>
  <b-container fluid class="py-2">
    <b-breadcrumb class="mt-1">
      <b-breadcrumb-item to="/cp/personals">Индивидуальные группы</b-breadcrumb-item>
      <b-breadcrumb-item active>Расписание {{title}}</b-breadcrumb-item>
    </b-breadcrumb>
    <b-input-group size="sm">
      <b-input-group-prepend>
        <b-button variant="outline-success" @click="createEvent()">
          <b-iconstack>
            <b-icon stacked icon="plus-circle-fill" shift-h="-4" shift-v="3" scale="0.6"></b-icon>
            <b-icon stacked icon="calendar" shift-h="0"></b-icon>
          </b-iconstack>&nbsp;
          <span class="d-none d-md-inline-block">Создать занятие</span>
        </b-button>
      </b-input-group-prepend>
      <b-form-select v-model="selectedMonth" :options="months" @change="fetchData()" />
      <b-form-select v-model="selectedYear" :options="years" @change="fetchData()" />
    </b-input-group>
    <FullCalendar
      ref="fullCalendar"
      defaultView="dayGridMonth"
      :header="{
        left: '',
        center: '',
        right: ''
      }"
      height="auto"
      locale="ru"
      :firstDay="1"
      :showNonCurrentDates="false"
      :fixedWeekCount="false"
      themeSystem="bootstrap"
      :plugins="calendarPlugins"
      :events="calendarEvents"
      @dateClick="handleDateClick"
    />
    <ModelModal
      modalId="eventModal"
      :baseUrl="eventUrl"
      :itemForm="eventForm"
      ref="eventModal"
      @formSaved="fetchData"
    />
    <ModelModal
      modalId="paymentModal"
      :baseUrl="paymentUrl"
      :itemForm="paymentForm"
      ref="paymentModal"
      @formSaved="fetchData"
    />
    <ModelModal
      modalId="groupModal"
      :baseUrl="groupUrl"
      :itemForm="groupForm"
      ref="groupModal"
      @formSaved="fetchData"
    />
  </b-container>
</template>
<script>
const GroupType = require("../../../../enums").GroupType;
import FullCalendar from "@fullcalendar/vue";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ModelModal from "../../components/ModelModal";
import { GroupForm, EventForm, PaymentForm } from "../../shared/forms";
export default {
  components: {
    ModelModal,
    FullCalendar
  },
  data() {
    return {
      title: "",
      eventUrl: "/events",
      groupUrl: "/groups",
      paymentUrl: "/payments",
      selectedYear: new Date().getFullYear(),
      years: this.getYears(),
      selectedMonth: new Date().getMonth(),
      months: this.$moment.months().map((m, i) => {
        return { value: i, text: m };
      }),
      groupForm: GroupForm,
      eventForm: EventForm,
      paymentForm: PaymentForm,
      instructor: null,
      groups: [],
      persons: [],
      places: [],
      events: [],
      defaultDuration: 60,
      calendarPlugins: [
        dayGridPlugin,
        interactionPlugin
      ],
      calendarEvents: []
    };
  },
  async mounted() {
    await this.fetchData();
    
  },
  methods: {
    async fetchData() {
      await this.fetchDetail();
      await this.fetchCalendar();
    },
    async fetchCalendar() {
     const events = await this.$getAsync(
        `/groups/instructor-schedule-events/${this.$route.params.id}`,
        { year: this.selectedYear, month: this.selectedMonth }
      );
      this.events = events;
      this.calendarEvents = this.toCalendarEvents(events);
      const calendar = this.$refs.fullCalendar.getApi();
      calendar.gotoDate(new Date(this.selectedYear, this.selectedMonth))
    },
    async fetchDetail() {
      const detail = await this.$getAsync(`/groups/instructor-detail/${this.$route.params.id}`);
      this.instructor = detail.instructor;
      this.title = this.instructor.name;
      this.eventForm[0].models = detail.groups;
      this.eventForm[1].models = detail.persons;
      this.eventForm[1].value = detail.instructor.id;
      this.eventForm[2].models = detail.places;
      this.groupForm[3].models = detail.persons;
      this.groupForm[3].value = detail.instructor.id;
      this.groupForm[4].models = detail.places;
    },
    createEvent() {
      this.eventForm[0].hidden = false;
      this.eventForm[1].value = this.$route.params.id;
      this.eventForm[1].hidden = true;
      let defaultStartsAt = new Date();
      defaultStartsAt.setHours(17, 0, 0, 0);
      this.eventForm[3].date = defaultStartsAt;
      this.eventForm[3].time = "17:00";
      this.eventForm[3].value = defaultStartsAt;
      this.eventForm[4].value = this.defaultDuration;
      this.$refs.eventModal.showAdd();
    },
    getYears() {
      const currentYear = new Date().getFullYear();
      var years = [];
      for (var i = currentYear - 5; i <= currentYear + 5; i++) {
        years.push(i);
      }
      return years;
    },
    handleDateClick(arg) {
      if (confirm("Would you like to add an event to " + arg.dateStr + " ?")) {
        this.calendarEvents.push({
          // add new event data
          title: "New Event",
          start: arg.date,
          allDay: arg.allDay
        });
      }
    },
    toCalendarEvents(events){
      return events.map(e => {
        return {
          title: e.group.name,
          start: new Date(e.startsAt)
        }
      })
    }
  }
};
</script>

<style lang='scss'>
@import "~@fullcalendar/core/main.css";
@import "~@fullcalendar/daygrid/main.css";
@import "~@fullcalendar/timegrid/main.css";
</style>