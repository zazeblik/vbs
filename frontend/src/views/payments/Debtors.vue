<template>
  <div class="py-2">
    <h5>Оплата занятий</h5>
    <b-input-group size="sm">
      <b-input-group-prepend class="switch-mode-block">
        <b-form-checkbox @change="switchDebtorsMode" />
      </b-input-group-prepend>
      <b-form-input value="С неоплаченными занятиями" disabled />
      <b-form-input v-model="nameFilter" type="text" placeholder="Введите ФИО" @change="nameFilterChanged" />
      <b-input-group-append>
        <b-button variant="outline-dark" @click="autoDebit">
          <b-icon icon="lightning-fill"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Оплатить индивидуальные занятия</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-list-group>
      <b-table class="py-2 small-table" small bordered sort-icon-left responsive :fields="fields" :items="shownPersons">
        <template v-slot:cell(events)="row">
          <b-button size="sm" variant="link" @click="addPaymentsModalShow(row.item.id)">
            <div>{{getUnpayedEventsCountText(row.item.id)}}</div>
            <div>{{getUnpayedMonthsCountText(row.item.id)}}</div>
          </b-button>
        </template>
      </b-table>
    </b-list-group>
    <PaymentsModal 
      modalId="paymentsModal"
      ref="paymentsModal"
      :payer = "payer"
      :generals="generals"
      :personals="personals"
      :unpayedEvents="personalUnpayedEvents"
      :unapyedGroupMonths="personalUnapyedGroupMonths"
      :instructors="instructors"
      @formSaved="fetchInfo" />
  </div>
</template>

<script>
import PaymentsModal from "../../components/PaymentsModal";
export default {
  components: {
    PaymentsModal
  },
  data() {
    return {
      baseUrl: '/debtors',
      groupsUrl: '/groups',
      payer: null,
      nameFilter: null,
      onlyDebtors: false,
      persons: [],
      shownPersons: [],
      generals: [],
      personals: [],
      instructors: [],
      unpayedEvents: {},
      unapyedGroupMonths: {},
      personalUnpayedEvents: [],
      personalUnapyedGroupMonths: [],
      fields: [
        { key: 'name', label: 'Имя', sortable: true },
        { key: 'balance', label: 'Баланс', sortable: true },
        { key: 'events', label: 'Не оплачено' }
      ],
    }
  },
  async mounted() {
    await this.fetchInfo();
  },
  methods: {
    async fetchInfo() {
      this.nameFilter = null;
      const settings = await this.$getAsync(`${this.baseUrl}/settings`);
      this.persons = settings.persons;
      this.shownPersons = settings.persons;
      this.generals = settings.generals;
      this.personals = settings.personals;
      this.unpayedEvents = settings.unpayedEvents;
      this.instructors = settings.instructors;
      this.unapyedGroupMonths = settings.unapyedGroupMonths;
    },
    addPaymentsModalShow(payerId){
      this.payer = payerId;
      this.personalUnpayedEvents = this.unpayedEvents[payerId];
      this.personalUnapyedGroupMonths = this.unapyedGroupMonths[payerId];
      this.$nextTick(function () {
        this.$refs.paymentsModal.show();
      });
      
    },
    getUnpayedEventsCountText(payerId){
      return `${this.unpayedEvents[payerId].length} занятий`;
    },
    getUnpayedMonthsCountText(payerId){
      return `${this.unapyedGroupMonths[payerId].length} месяцев`;
    },
    switchDebtorsMode(val){
      if (val) {
        this.shownPersons = this.persons.filter(x => this.unpayedEvents[x.id].length || this.unapyedGroupMonths[x.id].length)
      }
      else {
        this.shownPersons = this.persons;
      }
    },
    async autoDebit() {
      try {
        const nodes = [];
        const debtorsForModal = [];
        
        const personsWithEvents = this.persons.filter(x => this.unpayedEvents[x.id].length);
        for (let i = 0; i < personsWithEvents.length; i++) {
          const person = personsWithEvents[i];
          const events = this.unpayedEvents[person.id];
          let eventsDebit = 0;
          for (let j = 0; j < events.length; j++) {
            const event = events[j];
            const instructor = this.instructors.find(x => x.id == event.instructor);
            const prices = instructor.prices;
            const countPrice = prices.find(x => x.count == event.visitors.length) || prices[prices.length - 1];
            eventsDebit += countPrice.price;
          }
          if (person.balance < eventsDebit) {
            debtorsForModal.push(person.name);
          }
        }
        if (debtorsForModal.length) {
          const titlenode = <div>Список участников у которых не достаточно средств на балансе для оплаты задолженностей по индивидуальным занятиям:</div>;
          nodes.push(titlenode);
          nodes.push(<br />)
          for (let i = 0; i < debtorsForModal.length; i++) {
            nodes.push(<div>{debtorsForModal[i]}</div>)
          }
          nodes.push(<br />);
          nodes.push(<div>У остальных участников с задолженностями с баланса будут списаны средства автоматически.</div>);
        } else {
          nodes.push(<div>У всех участников с задолженностями с баланса будут списаны средства автоматически.</div>);
        }

        nodes.push(<br />);
        nodes.push(<div>Уверены, что хотите это сделать?</div>);
        
        const confirm = await this.$bvModal.msgBoxConfirm(nodes,
          {
            cancelTitle: "Отмена",
            cancelVariant: "outline-secondary",
            okTitle: "Списать",
            okVariant: "success"
          }
        );
        if (!confirm) return;
        await this.$postAsync(this.groupsUrl + "/auto-debit");
        this.$bvToast.toast("Занятия успешно оплачены", {
          title: "Автоматическая оплата занятий",
          variant: "success",
          autoHideDelay: 3000,
          solid: true,
        });
        await this.fetchInfo();
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    },
    nameFilterChanged(val) {
      if (val) {
        this.shownPersons = this.persons.filter(x => x.name.includes(val));
      } else {
        this.shownPersons = this.persons;
      }
    }
  }
}
</script>

<style scoped>
.small-table{
  font-size: small !important;
  overflow-y: auto;
  height: calc(100vh - 10rem);
}
.switch-mode-block {
  background: #e9ecef;
  border: 1px solid #ced4da;
  padding-top: 4px;
  padding-left: 6px;
  border-radius: 0.2rem;
}
</style>