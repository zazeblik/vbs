<template>
  <div class="py-2">
    <h5>Должники</h5> 
    <b-list-group>
      <b-table class="py-2 small-table" small bordered sort-icon-left responsive :fields="fields" :items="persons">
        <template v-slot:cell(events)="row">
          <b-button size="sm" variant="link" @click="addPaymentsModalShow(row.item.id)">{{getUnpayedEventsCountText(row.item.id)}}</b-button>
        </template>
        <template v-slot:cell(months)="row">
          <b-button size="sm" variant="link" @click="addPaymentsModalShow(row.item.id)">{{getUnpayedMonthsCountText(row.item.id)}}</b-button>
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
      payer: null,
      persons: [],
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
        { key: 'events', label: 'Не оплачено занятий', sortable: true },
        { key: 'months', label: 'Не оплачено месяцев', sortable: true }
      ],
      
    }
  },
  async mounted() {
    await this.fetchInfo();
  },
  methods: {
    async fetchInfo() {
      const settings = await this.$getAsync(`${this.baseUrl}/settings`);
      this.persons = settings.persons;
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
    }
  }
}
</script>

<style scoped>
.small-table{
  font-size: small !important;
  overflow-y: auto;
  height: calc(100vh - 105px);
}
</style>