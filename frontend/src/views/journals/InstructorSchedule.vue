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
      <b-input-group-append>
        <b-input-group-text >Всего часов: {{hoursSum}}</b-input-group-text>
        <b-input-group-text >Сумма оплат: {{paymentsSum}}</b-input-group-text>
        <b-button variant="outline-success" @click="exportData">
          <b-icon icon="file-earmark-arrow-down"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Экспорт</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-table
      :items="scheduleRows"
      :fields="scheduleFields"
      ref="schedule"
      class="my-2"
      small
      thead-tr-class="text-center"
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
const PersonalDebitMode = require("../../../../enums").PersonalDebitMode;
import ModelModal from "../../components/ModelModal";
import { EventForm } from "../../shared/forms";
export default {
  components: {
    ModelModal
  },
  data() {
    return {
      isBusy: false,
      title: "",
      groupUrl: "/groups",
      eventUrl: "/events",
      paymentUrl: "/payments",
      selectedYear: new Date().getFullYear(),
      years: this.$getYears(),
      selectedMonth: new Date().getMonth(),
      months: this.$moment.months().map((m, i) => {
        return { value: i, text: m };
      }),
      eventForm: Object.assign([], EventForm),
      instructor: null,
      groups: [],
      persons: [],
      places: [],
      events: [],
      hoursSum: 0,
      paymentsSum: 0,
      scheduleFields: [],
      scheduleRows: [],
      defaultDuration: 60
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
      this.isBusy = true;
      const calendar = await this.$getAsync(
        `${this.groupUrl}/instructor-schedule-calendar/${this.$route.params.id}`,
        { year: this.selectedYear, month: this.selectedMonth }
      );
      for (let i = 0; i < calendar.rows.length; i++) {
        const row = calendar.rows[i];
        for (const key in row) {
          row[key].date = new Date(row[key].date);
        }
      }
      for (let i = 0; i < calendar.fields.length; i++) {
        const field = calendar.fields[i];
        if (!field.isShown) field.class = 'd-none';
      }
      this.scheduleFields = calendar.fields;
      this.scheduleRows = calendar.rows;
      this.paymentsSum = calendar.totals.paymentsSum;
      this.hoursSum = calendar.totals.hoursSum;
      this.isBusy = false;
    },
    async fetchDetail() {
      const detail = await this.$getAsync(`${this.groupUrl}/instructor-detail/${this.$route.params.id}`);
      this.instructor = detail.instructor;
      this.title = this.instructor.name;
      this.groups = detail.groups;
      this.eventForm.find(f => f.property == "group").models = detail.groups;
      this.eventForm.find(f => f.property == "instructor").models = detail.persons;
      this.eventForm.find(f => f.property == "instructor").value = detail.instructor.id;
      this.eventForm.find(f => f.property == "place").models = detail.places;
    },
    async exportData() {
      await this.$getAsync(`${this.groupUrl}/export-personals`, {
        month: this.selectedMonth,
        year: this.selectedYear,
        instructor: this.$route.params.id
      }, true);
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
      await this.$postAsync(`${this.eventUrl}/delete/${event}`);
      await this.fetchCalendar();
    },
    async changeVisitorState(member, event){
      let autoDebit = false;
      let isVisitor = member.isVisitor;
      if (event.members.some(x => this.getMemberPaymentAvailability(x, event)) && this.$settings.debitMode == PersonalDebitMode.AlwaysAsk) {
        autoDebit = await this.promptMemeberPaymentAvailability();
      }
      const result = await this.$postAsync(`${this.eventUrl}/${isVisitor ? 'remove' : 'add' }-visitor/${event.id}`, { 
        visitors: [member.id],
        autoDebit: autoDebit
      }, true );
      if (result.success){
        this.updateEvents(result, event);
        return;
      }
      member.isVisitor = !isVisitor;
    },
    async checkAll(event){
      let autoDebit = false;
      const allChecked = event.members.every(m => m.isVisitor);
      const lostIds = event.members.filter(m => allChecked ? m.isVisitor : !m.isVisitor).map(m => m.id);
      if (!allChecked && event.members.some(x => this.getMemberPaymentAvailability(x, event)) && this.$settings.debitMode == PersonalDebitMode.AlwaysAsk){
        autoDebit = await this.promptMemeberPaymentAvailability();
      }
      const result = await this.$postAsync(
        `${this.eventUrl}/${!allChecked ? 'add' : 'remove' }-visitor/${event.id}`, 
        { 
          visitors: lostIds,
          autoDebit: autoDebit 
        },
        true );
      if (result.success){
        event.members.filter(m => lostIds.includes(m.id)).forEach(m => {
          m.isVisitor = !allChecked;
        });
        this.updateEvents(result, event);
      }
    },
    async promptMemeberPaymentAvailability() {
      return await this.$bvModal.msgBoxConfirm(`Пересчитать оплаты за занятие автоматически?`, {
        cancelTitle: "Отмена",
        cancelVariant: "outline-secondary",
        okTitle: "Пересчитать",
        okVariant: "success"
      });
    }, 
    updateEvents(result, event) {
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
      this.updateTotals();
    },
    updateMemberBalances(personBalances){
      if (!personBalances) return;
      for (const personId in personBalances) {
        for (let i = 0; i < this.scheduleRows.length; i++) {
          const row = this.scheduleRows[i];
          for (const key in row) {
            const cellEvents = row[key].events;
            cellEvents.forEach(e => {
              const member = e.members.find(m => m.id == personId);
              if (!member) return;
              member.balance = personBalances[personId];
            })
          }
        }
      }
    },
    updateTotals() {
      let events = [];
      for (let i = 0; i < this.scheduleRows.length; i++) {
        const r = this.scheduleRows[i];
        for (const key in r) {
          if (!r[key].events) continue;
          events = events.concat(r[key].events)
        } 
      }
      this.paymentsSum = 0;
      this.hoursSum = 0;
      let uniquePaymentIds = [];
      let uniqueStartsAt = [];
      for (let i = 0; i < events.length; i++) {
        const event = events[i];
        const visitors = event.members.filter(x => x.isVisitor);
        for (let j = 0; j < event.payments.length; j++) {
          const payment = event.payments[j];
          if (!uniquePaymentIds.includes(payment.id)){
            this.paymentsSum += payment.sum;
            uniquePaymentIds.push(payment.id);
          }
        }
        if (!visitors.length) continue;
        if (!uniqueStartsAt.includes(event.startsAt)){
          this.hoursSum += event.duration / 60;
          uniqueStartsAt.push(event.startsAt);
        }
      }
    },
    getMemberPaymentAvailability(member, event) {
      const group = this.groups.find(g => g.id == event.group);
      const visitors = event.members.filter(x => x.isVisitor);
      const isVisitorMemeber = visitors.map(x => x.id).includes(member.id);
      const visiorsCount = isVisitorMemeber ? visitors.length : (visitors.length + 1);
      const memberCost = this.$settings.divideSumMode ? (group.cost / visiorsCount) : group.cost;
      return member.balance >= memberCost;
    },
    getMemberPaymentColor(member, event){
      const isPayed = !!event.payments.find(p => p.person == member.id);
      if (isPayed) return 'success';
      return this.getMemberPaymentAvailability(member, event) ? 'primary' : 'danger';
    },
    getMemberFirstName(member) {
      return member.name.split(" ")[0];
    },
    getMemberSecondName(member) {
      return member.name.split(" ")[1];
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
    }
  }
};
</script>

<style scoped>
table {
  font-size: small;
}

table thead th{
  text-align: center;
  padding: .25rem !important;
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