<template>
  <div class="py-2">
    <b-input-group prepend="Тренер" size="sm">
      <model-select v-model="instructorId" :options="$modelsToOptions(instructors)" @input="selectedInstructorChanged" />
      <b-button
        v-if="toAdd.length || toRemove.length" 
        size="sm"
        variant="success"
        class="save-btn"
        @click="saveSelected()">
        <b-icon icon="check-square"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Сохранить</span>
      </b-button>
    </b-input-group>
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
      <b-form-select v-model="selectedMonth" :options="months" @change="fetchCalendar()" />
      <b-form-select v-model="selectedYear" :options="years" @change="fetchCalendar()" />
      <b-input-group-append>
        <b-input-group-text >Сумма оплат: {{Math.floor(paymentsSum)}}</b-input-group-text>
        <b-button variant="outline-success" @click="exportData">
          <b-icon icon="file-earmark-arrow-down"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Экспорт</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <div class="scrollable">
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
  </div>
</template>
<script>
import ModelModal from "../../components/ModelModal";
import { ModelSelect } from "vue-search-select";
import { EventForm } from "../../shared/forms";
export default {
  components: {
    ModelModal,
    ModelSelect
  },
  data() {
    return {
      isBusy: false,
      title: "",
      toAdd: [],
      toRemove: [],
      instructorsUrl: "/instructors",
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
      instructorId: null,
      groups: [],
      persons: [],
      events: [],
      instructors: [],
      paymentsSum: 0,
      scheduleFields: [],
      scheduleRows: [],
      defaultDuration: 60
    };
  },
  async mounted() {
    await this.fetchData();
  },
  async beforeRouteLeave(to, from, next) {
    if (this.toAdd.length || this.toRemove.length){
      const confirm = await this.$bvModal.msgBoxConfirm(
        `У вас остались несохранённые отметки о песещении. Хотите их сохранить и перейти уйти с этой страницы?`,
        {
          cancelTitle: "Уйти без сохранения",
          cancelVariant: "outline-secondary",
          okTitle: "Сохранить и уйти",
          okVariant: "success"
        }
      );
      if (confirm == null) {
        return;
      }
      if (!confirm) {
        return next();
      }
      if (confirm) {
        await this.saveSelected();
        return next();
      }
    }
    return next();
  },
  methods: {
    async fetchData() {
      await this.fetchDetail();
      await this.fetchCalendar();
    },
    async fetchCalendar() {
      this.isBusy = true;
      const calendar = await this.$getAsync(
        `${this.groupUrl}/instructor-schedule-calendar/${this.instructorId}`,
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
      this.isBusy = false;
    },
    async fetchDetail() {
      const detail = await this.$getAsync(`${this.groupUrl}/instructor-detail`);
      if (!detail.instructors.length){
        this.$error("Создайте хотябы одного тренера");
        this.$router.path({path: 'cp/instructors'});
        return;
      }
      this.instructorId = this.$user.instructor 
        ? this.$user.instructor 
        : detail.instructors[0].id; 
      const instructor = detail.instructors.find(x => x.id == this.instructorId);
      this.title = instructor.name;
      this.groups = detail.groups;
      this.instructors = detail.instructors;
      this.eventForm.find(f => f.property == "group").models = detail.groups;
      this.eventForm.find(f => f.property == "instructor").models = detail.instructors;
      this.eventForm.find(f => f.property == "instructor").value = this.instructorId;
    },
    async saveSelected() {
      if (this.toRemove.length){
        const groupedToRemove = Object.groupBy(this.toRemove, x => x.eventId);
        const eventIds = [...new Set(this.toRemove.map(x => x.eventId))];
        for (let i = 0; i < eventIds.length; i++) {
          const eventId = eventIds[i];
          const result = await this.$postAsync(
            `/events/remove-visitor/${eventId}`, 
            { visitors: groupedToRemove[eventId].map(x => x.visitorId) },
            true );
          if (result.success){
            this.toRemove = this.toRemove.filter(x => x.eventId != eventId);
          }
        }
      }
      if (this.toAdd.length){
        const groupedToAdd = Object.groupBy(this.toAdd, x => x.eventId);
        const eventIds = [...new Set(this.toAdd.map(x => x.eventId))];
        for (let i = 0; i < eventIds.length; i++) {
          const eventId = eventIds[i];
          const result = await this.$postAsync(
            `/events/add-visitor/${eventId}`, 
            { visitors: groupedToAdd[eventId].map(x => x.visitorId) },
            true );
          if (result.success){
            this.toAdd = this.toAdd.filter(x => x.eventId != eventId);
          }
        }
      }
    },
    async exportData() {
      await this.$getAsync(`${this.groupUrl}/export-personals`, {
        month: this.selectedMonth,
        year: this.selectedYear,
        instructor: this.instructorId
      }, true);
    },
    async showRemoveEventConfirm(event) {
      try {
        const nodes = [];
        if (this.$settings.autoRefundOnDeletePersonalEvents && event.payments.length){
          nodes.push(<div>Суммы оплат на баланс участников будут возвращены автоматически.</div>);  
          nodes.push(<br />);  
        }
        nodes.push(<div>Вы уверены, что хотите удалить занятие?</div>);
        const confirm = await this.$bvModal.msgBoxConfirm(
          nodes,
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
      const isVisitor = member.isVisitor;
      if (isVisitor) {
        const inRemove = this.toRemove.some(x => x.eventId == event.id && x.visitorId == member.id);
        if (inRemove) {
          this.toRemove = this.toRemove.filter(x => !(x.eventId == event.id && x.visitorId == member.id));
        } else {
          this.toAdd.push({eventId: event.id, visitorId: member.id});
        }
      } else {
        const inAdd = this.toAdd.some(x => x.eventId == event.id && x.visitorId == member.id);
        if (inAdd) {
          this.toAdd = this.toAdd.filter(x => !(x.eventId == event.id && x.visitorId == member.id));
        } else {
          this.toRemove.push({eventId: event.id, visitorId: member.id});
        }
      }
    },
    async checkAll(event){
      const allChecked = event.members.every(m => m.isVisitor);
      const lostIds = event.members.filter(m => allChecked ? m.isVisitor : !m.isVisitor).map(m => m.id);
      for (let i = 0; i < lostIds.length; i++) {
        const visitorId = lostIds[i];
        if (!allChecked) {
          const inRemove = this.toRemove.some(x => x.eventId == event.id && x.visitorId == visitorId);
          if (inRemove) {
            this.toRemove = this.toRemove.filter(x => !(x.eventId == event.id && x.visitorId == visitorId));
          } else {
            this.toAdd.push({eventId: event.id, visitorId: visitorId});
          }
        } else {
          const inAdd = this.toAdd.some(x => x.eventId == event.id && x.visitorId == visitorId);
          if (inAdd) {
            this.toAdd = this.toAdd.filter(x => !(x.eventId == event.id && x.visitorId == visitorId));
          } else {
            this.toRemove.push({eventId: event.id, visitorId: visitorId});
          }
        }
      }
      event.members.filter(m => lostIds.includes(m.id)).forEach(m => {
        m.isVisitor = !allChecked;
      });
    },
    getMemberPaymentAvailability(member, event) {
      const group = this.groups.find(g => g.id == event.group);
      const memberCost = group.cost;
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
      this.eventForm.find(f => f.property == "instructor").value = this.instructorId;
      this.eventForm.find(f => f.property == "duration").value = this.defaultDuration;
      this.$refs.eventModal.showAdd();
    },
    showEditEventModal(event) {
      this.eventForm.find(f => f.property == "group").hidden = true;
      this.$refs.eventModal.showEdit(event);
    },
    getEventStart(event) {
      return this.$moment(event.startsAt).format("HH:mm");
    },
    getEventEnd(event) {
      return this.$moment(event.startsAt).add('minutes', event.duration).format("HH:mm");
    },
    async selectedInstructorChanged(){
      this.eventForm.find(f => f.property == "instructor").value = this.instructorId;
      await this.fetchCalendar();
    },
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
.inline-block {
  display: inline-flex;
}
.with-btn {
  justify-content: space-between;
}
.scrollable {
  overflow-y: auto;
  height: calc(100vh - 11rem);
}
</style>