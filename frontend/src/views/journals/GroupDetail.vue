<template>
  <div class="py-2">
    <b-breadcrumb class="mt-1 with-btn">
      <div class="inline-block">
        <b-breadcrumb-item :to="isGeneralGroup ? '/cp/generals' : '/cp/personals'">{{isGeneralGroup ? 'Общие' : 'Индивидуальные'}} группы</b-breadcrumb-item>
        <b-breadcrumb-item active>{{title}}</b-breadcrumb-item>
      </div>
      <b-button
        v-if="toAdd.length || toRemove.length" 
        size="sm"
        variant="success"
        class="save-btn"
        @click="saveSelected()">
        <b-icon icon="check-square"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Сохранить</span>
      </b-button>
    </b-breadcrumb>
    <b-input-group size="sm">
      <b-input-group-prepend>
        <b-button variant="outline-success" @click="createEvent()">
          <b-iconstack>
            <b-icon stacked icon="plus-circle-fill" shift-h="-4" shift-v="3" scale="0.6"></b-icon>
            <b-icon stacked icon="calendar" shift-h="0"></b-icon>
          </b-iconstack>
          &nbsp;
          <span class="d-none d-md-inline-block">Создать занятие</span>
        </b-button>
      </b-input-group-prepend>
      <b-form-select v-model="selectedMonth" :options="months" @change="fetchSheet()" />
      <b-form-select v-model="selectedYear" :options="years" @change="fetchSheet()" />
      <b-input-group-append>
        <multiselect
          :value="selectedPersons"
          @input="(value) => {
            selectedPersons = value;
            addPersonsPlaceholder = value.length > 0 ? `${value.length} участников выбрано` : 'Выберите участников' 
          }"
          :options="availablePersons"
          :hidden="!addPersonShown"
          :multiple="true"
          :close-on-select="false" 
          :clear-on-select="false" 
          :preserve-search="true"
          :placeholder="addPersonsPlaceholder"
          :optionHeight="20"
          selectLabel=""
          selectedLabel=""
          deselectLabel="" 
          label="name"
          name="name"
          track-by="name"
          :preselect-first="true">
          <template slot="selection" slot-scope="{ values, isOpen }"><span v-if="isPlaceholderShown(values.length, isOpen)">{{ values.length }} участников выбрано</span></template>
          <template slot="noResult"><span class="multiselect-option">Ничего не найдено</span></template>
          <template slot="noOptions"><span class="multiselect-option">Нет вариантов</span></template>
          <template slot="option" slot-scope="props"><span class="multiselect-option">{{ props.option.name }}</span></template>
        </multiselect>
        <b-button variant="outline-success" :hidden="addPersonShown" @click="addPersonShown = true">
          <b-icon icon="person-plus-fill"></b-icon>
          &nbsp;
          <span class="d-none d-md-inline-block">Добавить участников</span> 
        </b-button>
        <b-button variant="outline-success" :hidden="!addPersonShown" @click="addPerson()">
          <b-icon icon="check"></b-icon>
        </b-button>
        <b-button variant="outline-danger" :hidden="!addPersonShown" @click="resetAddPersonsForm()">
          <b-icon icon="x"></b-icon>
        </b-button>
        <b-button variant="outline-primary" @click="showEditGroupModal()">
          <b-iconstack>
            <b-icon stacked icon="pencil" shift-h="4" shift-v="-2"></b-icon>
            <b-icon stacked icon="people-fill" shift-h="-5" shift-v="3" scale="0.9"></b-icon>
          </b-iconstack>
          &nbsp;
          <span class="d-none d-md-inline-block">Редактировать группу</span>
        </b-button>
        <b-button variant="outline-danger" @click="showDeleteGroupConfirm()">
          <b-iconstack>
            <b-icon stacked icon="trash" shift-h="5" shift-v="-2"></b-icon>
            <b-icon stacked icon="people-fill" shift-h="-7" shift-v="3" scale="0.9"></b-icon>
          </b-iconstack>
          &nbsp;
          <span class="d-none d-md-inline-block">Удалить группу</span>
        </b-button>
        <b-button variant="outline-success" @click="exportData">
          <b-icon icon="file-earmark-arrow-down"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Экспорт</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-table
      show-empty
      small
      bordered
      :items="rows"
      :fields="fields"
      hover
      sticky-header
      responsive="sm"
      class="my-2 sheet"
      :busy="isBusy"
      empty-text="Записей не найдено"
      empty-filtered-text="Записей не найдено"
      foot-clone
      foot-variant="light"
    >
      <template v-slot:head(person)="data">
        {{ data.label }}
      </template>

      <template v-slot:head(payments)="data">
        {{ data.label }}
      </template>

      <template v-slot:head(visits)="data">
        {{ data.label }}
      </template>

      <template v-slot:head()="data">
        <button type="button" class="check-all" title="Отметить всех" aria-label="checkAll" @click="checkAll(data.field)">
          <span aria-hidden="true"><b-icon icon="list-check"></b-icon></span>
        </button>
        <span class="date-head-border" :style="{borderColor: data.field.color}">{{ data.label }}</span>
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
          <b-dropdown-item @click="showEditEventModal(data.field)">Редактировать</b-dropdown-item>
          <b-dropdown-item @click="showRemoveEventConfirm(data.field)">Удалить</b-dropdown-item>
        </b-dropdown>
      </template>

      <template v-slot:cell(person)="data">
        <b>{{ data.index + 1 }}. {{ data.value.name }}</b>
        <b-dropdown size="sm" dropleft class="dropdown-actions" variant="link" toggle-class="text-decoration-none" no-caret>
          <template v-slot:button-content>
            <b-icon icon="three-dots-vertical"/><span class="sr-only">Actions</span>
          </template>
          <b-dropdown-item v-if="!allEventsPayed(data) && isGeneralGroup" @click="showAddPaymentModal(data.value)">Оплатить месяц</b-dropdown-item>
          <b-dropdown-item @click="showRemovePersonConfirm(data.value)">Удалить из группы</b-dropdown-item>
        </b-dropdown>
      </template>

      <template v-slot:cell(payments)="data">
        {{ Math.floor(data.value) }}
      </template>

      <template v-slot:cell(visits)="data">
        {{ data.value }}
      </template>

      <template v-slot:cell()="data">
        <div>
          <input 
            class="form-control form-control-sm"
            type="checkbox"
            v-model="data.value.visited" 
            @change="changeEventVisit(data.value)"/>
        </div>
        <div>
          <span v-if="!isGeneralGroup && data.value.payment">{{ data.value.payment.sum }}</span>
        </div>
      </template>

      <template v-slot:table-busy>
        <div class="text-center text-secondary my-2">
          <b-spinner small class="align-middle"></b-spinner>
          <strong>Загрузка...</strong>
        </div>
      </template>
      <template v-slot:foot()="data">
        <b>{{data.column == 'payments' ? Math.floor(totals[data.column]) : totals[data.column] }}</b>
      </template>
    </b-table>
    <ModelModal modalId="eventModal" :baseUrl="eventUrl" :itemForm="eventForm" ref="eventModal" @formSaved="fetchSheet" />
    <ModelModal modalId="paymentModal" :baseUrl="paymentUrl" :itemForm="paymentForm" ref="paymentModal" @formSaved="fetchSheet" />
    <ModelModal modalId="groupModal" :baseUrl="groupUrl" :itemForm="groupForm" ref="groupModal" @formSaved="fetchDetail" />
  </div>
</template>
<script>
const GroupType = require("../../../../enums").GroupType;
import Multiselect from 'vue-multiselect';
import ModelModal from "../../components/ModelModal";
import { GroupForm, EventForm, PaymentForm } from "../../shared/forms";
import { watch } from 'vue';

export default {
  components: {
    Multiselect,
    ModelModal
  },
  data() {
    return {
      group: null,
      title: "",
      addPersonsPlaceholder: "Выберите участников",
      isBusy: false,
      addPersonShown: false,
      isGeneralGroup: true,
      toAdd: [],
      toRemove: [],
      selectedPersons: [],
      persons: [],
      eventUrl: '/events',
      groupUrl: '/groups',
      paymentUrl: '/payments',
      selectedYear: new Date().getFullYear(),
      years: this.$getYears(),
      selectedMonth: new Date().getMonth(),
      months: this.$moment.months().map((m, i) => { return { value: i, text: m } }),
      fields: [],
      rows: [],
      totals: [],
      defaultInstructor: null,
      defaultDuration: null,
      groupForm: Object.assign([], GroupForm),
      eventForm: Object.assign([], EventForm),
      paymentForm: Object.assign([], PaymentForm)
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
  computed: {
    availablePersons() {
      const result = this.persons;
      return result;
    }
  },
  methods: {
    allEventsPayed(row){ 
      for (const key in row.item) {
        if (!isNaN(key) && !row.item[key].payed){
          return false;
        }
      }
      return true;
    },
    isPlaceholderShown(count, isOpen){
      return count && !isOpen;
    },
    async exportData() {
      await this.$getAsync(`${this.groupUrl}/export`, {
        month: this.selectedMonth,
        year: this.selectedYear,
        group: this.group.id
      }, true);
    },
    resetAddPersonsForm(){
      this.addPersonShown = false; 
      this.selectedPersons = [];
      this.addPersonsPlaceholder = "Выберите участников";
    },
    createEvent(){
      this.eventForm.find(f => f.property == "group").value = this.$route.params.id;
      this.eventForm.find(f => f.property == "instructor").value = this.defaultInstructor;
      this.eventForm.find(f => f.property == "duration").value = this.defaultDuration;
      this.eventForm.find(f => f.property == "startsAt").value = this.getNextNearTime();
      this.$refs.eventModal.showAdd();
    },
    getNextNearTime() {
      const currentDate = new Date();
      const isCurrentMonth = currentDate.getFullYear() == this.selectedYear && currentDate.getMonth() == this.selectedMonth;
      let firstDate = 1;
      let hours = 17;
      let minutes = 0;
      let nextDate = new Date(this.selectedYear, this.selectedMonth, isCurrentMonth ? currentDate.getDate() : firstDate);
      if (this.group.schedule) {
        let scheduleItems = this.group.schedule.split(",");
        let scheduleDays = scheduleItems.map(x => { 
          return { 
            weekDay: Number(x.split(" ")[0]),
            hours: Number((x.split(" ")[1]).split(":")[0]),
            minutes: Number((x.split(" ")[1]).split(":")[1]),
          }
        });
        let days = scheduleDays
          .map(x => this.nextWeekDay(nextDate, x.weekDay));
        nextDate = new Date(Math.min.apply(null,days));
        let findedDay = scheduleDays.find( x => x.weekDay == nextDate.getDay());
        hours = findedDay.hours;
        minutes = findedDay.minutes;
      }
      nextDate.setHours(hours);
      nextDate.setMinutes(minutes);
      nextDate.setSeconds(0);
      nextDate.setMilliseconds(0);
      return nextDate;
    },
    nextWeekDay(startDate, weekDay){
      let date = new Date(startDate.getTime());
      date.setDate(date.getDate() + (weekDay+(7-date.getDay())) % 7);
      return date;
    },
    showEditEventModal(field) {
      this.$refs.eventModal.showEdit(field.event);
    },
    showAddPaymentModal(person){
      this.paymentForm.find(f => f.property == "person").value = person.id;
      this.paymentForm.find(f => f.property == "group").value = this.group.id;
      this.paymentForm.find(f => f.property == "sum").value = this.group.cost;
      this.paymentForm.find(f => f.property == "month").value = this.selectedMonth;
      this.paymentForm.find(f => f.property == "year").value = this.selectedYear;
      this.paymentForm.find(f => f.property == "description").value = 
        `Оплата за ${this.months[this.selectedMonth].text} ${this.selectedYear}г.`;

      this.$refs.paymentModal.showAdd();
    },
    showEditGroupModal(){
      this.$refs.groupModal.showEdit(this.group);
    },
    async showDeleteGroupConfirm(){
      try {
        const confirm = await this.$bvModal.msgBoxConfirm(
          `Вы уверены, что хотите удалить группу ${this.group.name}?`,
          {
            cancelTitle: "Отмена",
            cancelVariant: "outline-secondary",
            okTitle: "Убрать",
            okVariant: "danger"
          }
        );
        if (!confirm) return;
        await this.$postAsync(`/groups/delete/${this.group.id}`);
        const path = this.group.type == GroupType.General ? 'generals' : 'personals';
        this.$router.push({name: path});
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    },
    async checkAll(field){
      const allChecked = this.rows.every(row => row[field.key].visited);
      const lostIds = this.rows.filter(r => allChecked ? r[field.key].visited : !r[field.key].visited ).map(row => row[field.key].visitorId)
      for (let i = 0; i < lostIds.length; i++) {
        const visitorId = lostIds[i];
        if (!allChecked) {
          const inRemove = this.toRemove.some(x => x.eventId == field.eventId && x.visitorId == visitorId);
          if (inRemove) {
            this.toRemove = this.toRemove.filter(x => !(x.eventId == field.eventId && x.visitorId == visitorId));
          } else {
            this.toAdd.push({eventId: field.eventId, visitorId: visitorId});
          }
        } else {
          const inAdd = this.toAdd.some(x => x.eventId == field.eventId && x.visitorId == visitorId);
          if (inAdd) {
            this.toAdd = this.toAdd.filter(x => !(x.eventId == field.eventId && x.visitorId == visitorId));
          } else {
            this.toRemove.push({eventId: field.eventId, visitorId: visitorId});
          }
        }
      }
      this.rows.filter(r => lostIds.includes(r[field.key].visitorId)).forEach(row => {
        row[field.key].visited = !allChecked;
      });
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
    async showRemovePersonConfirm(person) {
      try {
        const confirm = await this.$bvModal.msgBoxConfirm(
          `Вы уверены, что хотите удалить ${person.name} из группы?`,
          {
            cancelTitle: "Отмена",
            cancelVariant: "outline-secondary",
            okTitle: "Удалить",
            okVariant: "danger"
          }
        );
        if (!confirm) return;
        await this.removePerson(person.id);
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    },
    async showRemoveEventConfirm(field) {
      try {
        const nodes = [];
        if (this.$settings.autoRefundOnDeletePersonalEvents && !this.isGeneralGroup && field.event.payments.length){
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
        await this.removeEvent(field.eventId);
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    },
    async addPerson() {
      if (this.selectedPersons.length == 0){
        return;
      }
      await this.$postAsync(`/groups/add-persons/${this.$route.params.id}`, { persons: this.selectedPersons.map(x => x.id) });
      this.resetAddPersonsForm();
      await this.fetchData();
    },
    async removePerson(person) {
      await this.$postAsync(`/groups/remove-person/${this.$route.params.id}`, { person });
      await this.fetchData();
    },
    async removeEvent(event){
      await this.$postAsync(`/events/delete/${event}`);
      await this.fetchData();
    },
    async changeEventVisit(cell){
      if (cell.visited) {
        const inRemove = this.toRemove.some(x => x.eventId == cell.eventId && x.visitorId == cell.visitorId);
        if (inRemove) {
          this.toRemove = this.toRemove.filter(x => !(x.eventId == cell.eventId && x.visitorId == cell.visitorId));
        } else {
          this.toAdd.push({eventId: cell.eventId, visitorId: cell.visitorId});
        }
      } else {
        const inAdd = this.toAdd.some(x => x.eventId == cell.eventId && x.visitorId == cell.visitorId);
        if (inAdd) {
          this.toAdd = this.toAdd.filter(x => !(x.eventId == cell.eventId && x.visitorId == cell.visitorId));
        } else {
          this.toRemove.push({eventId: cell.eventId, visitorId: cell.visitorId});
        }
      }
    },
    async fetchData(){
      await this.fetchDetail();
      await this.fetchSheet();
    },
    async fetchSheet() {
      this.isBusy = true;
      const sheet = await this.$getAsync(`/groups/sheet/${this.$route.params.id}`, { year: this.selectedYear, month: this.selectedMonth });
      this.rows = sheet.rows;
      this.fields = sheet.fields;
      this.totals = sheet.totals;
      this.isBusy = false;
    },
    async fetchDetail() {
      const detail = await this.$getAsync(`/groups/detail/${this.$route.params.id}`);
      this.group = detail.group;
      this.isGeneralGroup = this.group.type == GroupType.General; 
      this.persons =  detail.persons;
      this.defaultInstructor = detail.group.defaultInstructor 
        ? detail.group.defaultInstructor
        : this.$user.instructor;
      this.eventForm.find(f => f.property == "group").hidden = true;
      this.eventForm.find(f => f.property == "instructor").models = detail.instructors;
      this.groupForm.find(f => f.property == "defaultInstructor").models = detail.instructors;
      this.groupForm.find(f => f.property == "hidden").hidden = true;
      this.defaultDuration = detail.group.defaultDuration;
      this.selectedPersons = [];
      this.title = this.group.name;
    }
  }
};
</script>

<style scoped>
.sheet {
  font-size: small;
  max-height: calc(100vh - 13rem);
}

.multiselect-option {
  padding: 0 8px;
  font-size: 0.875rem !important;
}

table input[type="checkbox"] {
  height: 20px;
}
.inline-block {
  display: inline-flex;
}
.with-btn {
  justify-content: space-between;
}
.date-head-border{
  border: 2px solid;
  border-radius: 3px;
}
.save-btn {
  position: absolute;
  right: 1.5rem;
  top: 1.2rem;
}
</style>

<style src="vue-multiselect/dist/vue-multiselect.min.css"></style>