<template>
  <div class="py-2">
    <b-breadcrumb class="mt-1">
      <b-breadcrumb-item to="/cp/personals">Индивидуальные группы</b-breadcrumb-item>
      <b-breadcrumb-item active>{{title}}</b-breadcrumb-item>
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
    <b-table
      :items="correctedRows"
      :fields="scheduleFields"
      ref="schedule"
      class="my-2"
      bordered
      stacked="lg"
      :busy="isBusy"
      empty-text="Записей не найдено"
      empty-filtered-text="Записей не найдено">
      <template v-slot:cell()="row">
        <div class="w-100">{{row.value.isShown ? row.value.date.getDate() : ""}}</div>
        <b-card
          v-for="event in row.value.events"
          :key="event.id"
          border-variant="dark"
          header-class="p-1"
          body-class="p-0"
          class="mb-1" 
          align="center"
        >
          <template v-slot:header>
            <button type="button" class="check-all card-header-icon" title="Отметить всех" aria-label="checkAll" @click="checkAll(event)">
              <span aria-hidden="true"><b-icon icon="list-check"></b-icon></span>
            </button>
            {{getEventStart(event)}}‒{{getEventEnd(event)}}
            <b-dropdown
              size="sm" 
              dropleft 
              class="dropdown-actions" 
              variant="link" 
              toggle-class="text-decoration-none" 
              no-caret>
              <template v-slot:button-content>
                <b-icon icon="three-dots-vertical"/><span class="sr-only">Actions</span>
              </template>
              <b-dropdown-item @click="showEditEventModal(event)">Редактировать</b-dropdown-item>
              <b-dropdown-item @click="showRemoveEventConfirm(event)">Удалить</b-dropdown-item>
            </b-dropdown>
          </template>
          <b-list-group>
            <b-list-group-item 
              class="p-0 pl-1 text-left"
              v-for="member in event.members"
              :variant="getMemberPaymentColor(member, event)"
              :key="member.id">
              <b-checkbox 
                v-model="member.isVisitor"
                @change="changeVisitorState(member, event)"
                inline>
                {{getMemberFirstName(member)}}&nbsp;&nbsp;
                <span class="d-none d-sm-inline-block">{{getMemberSecondName(member)}}</span>
              </b-checkbox>
            </b-list-group-item>
          </b-list-group>
        </b-card>
      </template>
    </b-table>
    <ModelModal
      modalId="eventModal"
      :baseUrl="eventUrl"
      :itemForm="eventForm"
      ref="eventModal"
      @formSaved="fetchData"
    />
  </div>
</template>
<script>
const GroupType = require("../../../../enums").GroupType;
import ModelModal from "../../components/ModelModal";
import { GroupForm, EventForm } from "../../shared/forms";
export default {
  components: {
    ModelModal
  },
  data() {
    return {
      isBusy: false,
      title: "",
      eventUrl: "/events",
      paymentUrl: "/payments",
      selectedYear: new Date().getFullYear(),
      years: this.$getYears(),
      selectedMonth: new Date().getMonth(),
      months: this.$moment.months().map((m, i) => {
        return { value: i, text: m };
      }),
      eventForm: EventForm,
      instructor: null,
      groups: [],
      persons: [],
      places: [],
      events: [],
      scheduleFields: [],
      scheduleRows: [],
      defaultDuration: 60
    };
  },
  async mounted() {
    await this.fetchData();
  },
  computed: {
    correctedRows() {
      let result = [];
      let appendWeek={
        "1": { isShown: false, events: [] },
        "2": { isShown: false, events: [] },
        "3": { isShown: false, events: [] },
        "4": { isShown: false, events: [] },
        "5": { isShown: false, events: [] },
        "6": { isShown: false, events: [] }
      };
      this.scheduleRows.forEach((week, index) => {
        for (const day in week) {
          if (day == "0"){
            if (!result[index-1]) {
              if (week[day].isShown) appendWeek["0"] = week[day];
            } else {
              result[index-1]["0"] =  week[day];
            }
          } else {
            if (!result[index]) result[index] = {};
            result[index][day] = week[day];  
          }
        }
      });
      result = appendWeek["0"] ? [appendWeek, ...result] : result;
      result = result.filter(w => this.weekContainsEvents(w));
      result.forEach((w, index) => {
        if (!result[index]["0"]) {
          let sundayDate = new Date(result[index]["6"].date);
          sundayDate.setDate(sundayDate.getDate() + 1);
          result[index]["0"] = { isShown: true, date: sundayDate, events: [] };
        }
      })
      return result;
    }
  },
  methods: {
    async fetchData() {
      await this.fetchDetail();
      await this.fetchCalendar();
    },
    async fetchCalendar() {
      this.isBusy = true;
      const events = await this.$getAsync(
        `/groups/instructor-schedule-events/${this.$route.params.id}`,
        { year: this.selectedYear, month: this.selectedMonth }
      );
      this.events = this.fillMemberVisits(events);
      this.scheduleFields = this.getFields();
      this.scheduleRows = this.getRows();
      this.isBusy = false;
    },
    async fetchDetail() {
      const detail = await this.$getAsync(`/groups/instructor-detail/${this.$route.params.id}`);
      this.instructor = detail.instructor;
      this.title = this.instructor.name;
      this.groups = detail.groups;
      this.eventForm.find(f => f.property == "group").models = detail.groups;
      this.eventForm.find(f => f.property == "instructor").models = detail.persons;
      this.eventForm.find(f => f.property == "instructor").value = detail.instructor.id;
      this.eventForm.find(f => f.property == "place").models = detail.places;
    },
    async showRemoveEventConfirm(event) {
      try {
        const confirm = await this.$bvModal.msgBoxConfirm(
          `Вы уверены, что хотите удалить занятие?`,
          {
            cancelTitle: "Отмена",
            cancelVariant: "outline-secondary",
            okTitle: "Удалить",
            okVariant: "danger"
          }
        );
        if (!confirm) return;
        await this.removeEvent(event.id);
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    },
    async removeEvent(event){
      await this.$postAsync(`/events/delete/${event}`);
      await this.fetchCalendar();
    },
    async changeVisitorState(member, event){
      const result = await this.$postAsync(
        `/events/${member.isVisitor ? 'remove' : 'add' }-visitor/${event.id}`, 
        { visitors: [member.id] },
        true );
      if (result.success){
        if (result.createdPayments && result.createdPayments.length){
          result.createdPayments.forEach(p => event.payments.push(p)); 
        }
        if (result.removedPayments && result.removedPayments.length){
          result.removedPayments.forEach(p => {
            event.payments.splice(event.payments.findIndex(ep => ep.id == p), 1);
          }); 
        }
        if (result.updatedPayments && result.updatedPayments.length){
          result.updatedPayments.forEach(p => {
            event.payments.splice(event.payments.findIndex(ep => ep.id == p.id), 1);
            event.payments.push(p);
          }); 
        }
        this.updateMemberBalances(result.personBalances);
        return;
      }
      
      member.isVisitor = !member.isVisitor;
    },
    async checkAll(event){
      const allChecked = event.members.every(m => m.isVisitor);
      const lostIds = event.members.filter(m => allChecked ? m.isVisitor : !m.isVisitor ).map(m => m.id)
      const result = await this.$postAsync(
        `/events/${!allChecked ? 'add' : 'remove' }-visitor/${event.id}`, 
        { visitors: lostIds },
        true );
      if (result.success){
        event.members.filter(m => lostIds.includes(m.id)).forEach(m => {
          m.isVisitor = !allChecked;
        });
        if (result.createdPayments && result.createdPayments.length){
          result.createdPayments.forEach(p => event.payments.push(p)); 
        }
        if (result.removedPayments && result.removedPayments.length){
          result.removedPayments.forEach(p => {
            event.payments.splice(event.payments.findIndex(ep => ep.id == p), 1);
          }); 
        }
        this.updateMemberBalances(result.personBalances);
      }
    },
    updateMemberBalances(personBalances){
      if (!personBalances) return;
      for (const personId in personBalances) {
        this.events.forEach(e => {
          const member = e.members.find(m => m.id == personId);
          if (!member) return;
          member.balance = personBalances[personId];
        })
      }
    }, 
    fillMemberVisits(events){
      events.forEach(e => {
        e.members.forEach(m => {
          m.isVisitor = this.isEventVisitor(m, e);
        })
        delete e.visitors;
      })
      return events;
    },
    isEventVisitor(member, event){
      return !!event.visitors.find(v => v.id == member.id);
    },
    getMemberPaymentColor(member, event){
      const isPayed = !!event.payments.find(p => p.person == member.id);
      if (isPayed) return 'success';
      const group = this.groups.find(g => g.id == event.group);
      const visitors = event.members.filter(x => x.isVisitor);
      const isVisitorMemeber = visitors.map(x => x.id).includes(member.id);
      const visiorsCount = isVisitorMemeber ? visitors.length : (visitors.length + 1);
      const memberCost = group.cost / visiorsCount; // 1 если надо платить всем
      if (member.balance >= memberCost) return 'primary';
      return 'danger';
    },
    getMemberFirstName(member) {
      return member.name.split(" ")[0];
    },
    getMemberSecondName(member) {
      return member.name.split(" ")[1];
    },
    weekContainsEvents(week){
      for (const day in week) {
        if (week[day].events.length) return true;
      }
      return false;
    },
    createEvent() {
      this.eventForm.find(f => f.property == "group").hidden = false;
      this.eventForm.find(f => f.property == "instructor").value = this.$route.params.id;
      this.eventForm.find(f => f.property == "instructor").hidden = true;
      this.eventForm.find(f => f.property == "duration").value = this.defaultDuration;
      this.$refs.eventModal.showAdd();
    },
    showEditEventModal(event) {
      this.eventForm.find(f => f.property == "group").hidden = true;
      this.eventForm.find(f => f.property == "instructor").hidden = false;
      this.$refs.eventModal.showEdit(event);
    },
    getEventStart(event) {
      return this.$moment(event.startsAt).format("HH:mm");
    },
    getEventEnd(event) {
       return this.$moment(event.startsAt).add('minutes', event.duration).format("HH:mm");
    },
    getFields(){
      let weekdays = this.$moment.weekdays();
      let fields = [];
      weekdays.forEach((wd, index) => {
        fields.push({
          label: wd,
          key: index.toString(),
          thClass: 'text-center p-1',
          tdClass:'p-1',
          class: this.events.every(e => new Date(e.startsAt).getDay() != index ) ? 'd-none' : ''
        });
      });
      fields.push(fields.shift());
      return fields;
    },
    getRows(){
      let month = [];
      const weekNumbers = [...new Set(this.events.map(e => this.getWeekNumber(e.startsAt)))];
      for (let i = 0; i < weekNumbers.length; i++) {
        let week = {}; 
        this.scheduleFields.map(sf => {
          const day = sf.key; 
          const date = this.getWeekDayDate(weekNumbers[i], day); 
          const isShown = date.getFullYear() == this.selectedYear && date.getMonth() == this.selectedMonth;  
          week[day] = { date, isShown, events: this.getWeekDayEvents(date) };
        });
        
        month.push(week);
      }
      return month
    },
    getWeekNumber(startsAt){
      const date = new Date(startsAt);
      let startOfMonthDate = new Date(startsAt);
      startOfMonthDate.setDate(1);
      const startOfMonthDay = startOfMonthDate.getDay() - 1;
      const weekdayNumber = Math.floor((date.getDate() + startOfMonthDay) / 7);
      return weekdayNumber;
    },
    getWeekDayEvents(date){
      const startOfDate = this.$moment([date.getFullYear(), date.getMonth(), date.getDate()]);
      const endOfDate = this.$moment(startOfDate).endOf('day');
      return this.events.filter(e => e.startsAt >= startOfDate.valueOf() && e.startsAt <= endOfDate.valueOf());
    },
    getWeekDayDate(week, day){
      let date = new Date(this.selectedYear, this.selectedMonth);
      const dayOffset = day - date.getDay();
      date.setDate(date.getDate() + week * 7 + dayOffset);
      return date;
    }
  }
};
</script>

<style scoped>
table {
  font-size: small;
}
.card-header-icon{
  height: 20px;
}
.event-visit{
  width: 20px;
  height: 20px;
  margin: 0px;
  padding: 0px 5px;
}
</style>