<template>
  <b-container fluid class="py-2">
    <b-breadcrumb class="mt-1">
      <b-breadcrumb-item to="/cp/groups">Общие группы</b-breadcrumb-item>
      <b-breadcrumb-item active>{{title}}</b-breadcrumb-item>
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
        <model-select v-model="selectedPerson" :options="availablePersons" :hidden="!addPersonShown" />
        <b-button variant="outline-success" :hidden="addPersonShown" @click="addPersonShown = true">
          <b-icon icon="person-plus-fill"></b-icon>
          &nbsp;
          <span class="d-none d-md-inline-block">Добавить участника</span>
        </b-button>
        <b-button variant="outline-success" :hidden="!addPersonShown" @click="addPerson()">
          <b-icon icon="check"></b-icon>
        </b-button>
        <b-button variant="outline-danger" :hidden="!addPersonShown" @click="addPersonShown = false">
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
      </b-input-group-append>
    </b-input-group>
    <b-table
      show-empty
      small
      bordered
      :items="rows"
      :fields="fields"
      hover
      class="my-2"
      :busy="isBusy"
      empty-text="Записей не найдено"
      empty-filtered-text="Записей не найдено"
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
        {{ data.label }}
        <button type="button" class="close" title="Удалить занятие" aria-label="Close" @click="showRemoveEventConfirm(data.field)">
          <span aria-hidden="true"><b-icon icon="plus" rotate="45"></b-icon></span>
        </button>
      </template>

      <template v-slot:cell(person)="data">
        <b>{{ data.value.name }}</b>
        <b-dropdown size="sm" dropleft class="dropdown-actions" variant="link" toggle-class="text-decoration-none" no-caret>
          <template v-slot:button-content>
            <b-icon icon="three-dots-vertical"/><span class="sr-only">Actions</span>
          </template>
          <b-dropdown-item @click="showArchivePersonConfirm(data.value)">Перевести в архив</b-dropdown-item>
          <b-dropdown-item @click="showRemovePersonConfirm(data.value)">Удалить из группы</b-dropdown-item>
        </b-dropdown>
      </template>

      <template v-slot:cell(payments)="row">
        {{ getRowTotalPayments(row) }}
      </template>

      <template v-slot:cell(visits)="row">
        {{ getRowTotalVisits(row) }}
      </template>

      <template v-slot:cell()="data">
        <input 
          class="form-control form-control-sm"
          type="checkbox"
          v-model="data.value.visited" 
          @change="changeEventVisit(data.value)"/>
      </template>

      <template v-slot:table-busy>
        <div class="text-center text-secondary my-2">
          <b-spinner small class="align-middle"></b-spinner>
          <strong>Загрузка...</strong>
        </div>
      </template>
    </b-table>
    <ModelModal modalId="eventModal" :baseUrl="eventUrl" :itemForm="eventForm" ref="eventModal" @formSaved="fetchSheet" />
    <ModelModal modalId="groupModal" :baseUrl="groupUrl" :itemForm="groupForm" ref="groupModal" @formSaved="fetchDetail" />
  </b-container>
</template>
<script>
const GroupType = require("../../../../enums").GroupType;
import { ModelSelect } from 'vue-search-select'
import ModelModal from "../../components/ModelModal";
import { GroupForm, EventForm } from "../../shared/forms";
export default {
  components: {
    ModelSelect,
    ModelModal
  },
  data() {
    return {
      group: null,
      title: "",
      isBusy: false,
      addPersonShown: false,
      selectedPerson: null,
      persons: [],
      eventUrl: '/events',
      groupUrl: '/groups',
      selectedYear: new Date().getFullYear(),
      years: this.getYears(),
      selectedMonth: new Date().getMonth(),
      months: this.$moment.months().map((m, i) => { return { value: i, text: m } }),
      fields: [],
      rows: [],
      defaultInstructor: null,
      defaultPlace: null,
      defaultDuration: null,
      groupForm: GroupForm,
      eventForm: EventForm
    };
  },
  async mounted() {
    await this.fetchData();
  },
  computed: {
    availablePersons() {
      return this.persons.filter(p => p.value != this.group.defaultInstructor)
    }
  },
  methods: {
    createEvent(){
      this.eventForm[0].value = this.$route.params.id;
      this.eventForm[1].value = this.defaultInstructor;
      this.eventForm[2].value = this.defaultPlace;
      let defaultStartsAt = new Date();
      defaultStartsAt.setHours(17, 0, 0, 0);
      this.eventForm[3].date = defaultStartsAt;
      this.eventForm[3].time = "17:00";
      this.eventForm[3].value = defaultStartsAt;
      this.eventForm[4].value = this.defaultDuration;
      this.$refs.eventModal.showAdd();
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
        this.$router.push({name: 'groups'});
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    },
    async checkAll(field){
      const allChecked = this.rows.every(row => row[field.key].visited);
      const lostIds = this.rows.filter(r => allChecked ? r[field.key].visited : !r[field.key].visited ).map(row => row[field.key].visitorId)
      const result = await this.$postAsync(
        `/events/${!allChecked ? 'add' : 'remove' }-visitor/${field.eventId}`, 
        { visitors: lostIds },
        true );
      if (result.success){
        this.rows.filter(r => lostIds.includes(r[field.key].visitorId)).forEach(row => {
          row[field.key].visited = !allChecked;
        });
        return;
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
    async showArchivePersonConfirm(person) {
      try {
        const confirm = await this.$bvModal.msgBoxConfirm(
          `Вы уверены, что хотите убрать в архив ${person.name}?`,
          {
            cancelTitle: "Отмена",
            cancelVariant: "outline-secondary",
            okTitle: "Убрать",
            okVariant: "danger"
          }
        );
        if (!confirm) return;
        await this.archivePerson(person.id);
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    },
    async showRemoveEventConfirm(field) {
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
        await this.removeEvent(field.eventId);
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    },
    async addPerson() {
      await this.$postAsync(`/groups/add-person/${this.$route.params.id}`, { person: this.selectedPerson });
      this.addPersonShown = false;
      await this.fetchData();
    },
    async removePerson(person) {
      await this.$postAsync(`/groups/remove-person/${this.$route.params.id}`, { person });
      await this.fetchData();
    },
    async archivePerson(person) {
      await this.$postAsync(`/archivepersons`, { group: this.$route.params.id, person });
      await this.fetchData();
    },
    async removeEvent(event){
      await this.$postAsync(`/events/delete/${event}`);
      await this.fetchData();
    },
    async changeEventVisit(cell){
      const result = await this.$postAsync(
        `/events/${cell.visited ? 'add' : 'remove' }-visitor/${cell.eventId}`, 
        { visitors: [cell.visitorId] },
        true );
      if (result.success)
        return;
      
      cell.visited = !cell.visited;
    },
    getRowTotalVisits(row){
      let totalVisits = 0;
      for (const key in row.item) {
        if (!isNaN(key) && row.item[key].visited){
          totalVisits++
        }
      }
      return totalVisits;
    },
    getRowTotalPayments(row){
      let totalPayments = 0;
      let payIds = [];
      for (const key in row.item) {
        if (!isNaN(key) && row.item[key].payed && !payIds.includes(row.item[key].payment.id)){
          totalPayments += row.item[key].payment.sum;
          payIds.push(row.item[key].payment.id);
        }
      }
      return `${totalPayments} (${payIds.length} шт.)`;
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
      this.isBusy = false;
    },
    async fetchDetail() {
      const detail = await this.$getAsync(`/groups/detail/${this.$route.params.id}`);
      this.group = detail.group;
      
      this.persons =  this.$modelsToOptions(detail.persons);
      this.eventForm[1].models = detail.persons;
      this.defaultInstructor = detail.group.defaultInstructor;
      this.eventForm[2].models = detail.places;
      this.groupForm[3].models = detail.persons;
      this.groupForm[4].models = detail.places;
      this.defaultPlace = detail.group.defaultPlace;
      this.defaultDuration = detail.group.defaultDuration;
      this.selectedPerson = null;
      this.title = this.group.name;
    },
    getYears() {
      const currentYear = new Date().getFullYear();
      var years = [];
      for (var i = currentYear - 5; i <= currentYear + 5; i++) {
          years.push(i);
      }
      return years;
    }
  }
};
</script>

<style scoped>
table {
  font-size: small;
}

table input[type="checkbox"] {
  height: 20px;
}
</style>