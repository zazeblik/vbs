<template>
  <div>
    <validation-observer ref="observer" v-slot="{ invalid }">
    <b-modal
      :id="modalId"
      title="Оплата занятий"
      @close="resetForm"
      @cancel="resetForm"
      size="lg"
      hide-footer
      no-stacking
    >
      <b-form>
        <b-form-group label="Шаблоны" :hidden="!payer || paymentTemplates.length == 0" label-cols-sm="2">
          <b-list-group>
            <b-list-group-item 
              class="py-1 px-2"
              v-for="(template, index) in paymentTemplates" 
              :key="'template'+index">
              {{getPaymentDescription(template)}} - {{template.sum}} руб.
              <button
                type="button"
                class="close"
                @click="templateToPayment(template, index)">
                <span aria-hidden="true">&darr;</span>
              </button>
            </b-list-group-item>
          </b-list-group>
        </b-form-group>
        <b-form-row
          v-for="(payment, index) in payments" 
          :key="'payment'+index"
          class="border pb-1 mb-1 bg-light">
          <b-col v-if="isGeneralGroupType(payment)">
            <label>Группа</label>
            <validation-provider
              :name="'group' + index"
              :rules="{required: true}"
              v-slot="validationContext">
              <model-select
                :options="$modelsToOptions(payment.groups)"
                :value="payment.group"
                @input="payment.group = $event; tryFetchGroupEvents(payment);"
                :state="getValidationState(validationContext)" />
            </validation-provider>
          </b-col>
          <b-col v-if="isGeneralGroupType(payment)">
            <label>Месяц</label>
            <validation-provider
              :name="'month' + index"
              :rules="{required: true}"
              v-slot="validationContext">
              <b-form-select
                size="sm"
                :options="months"
                v-model="payment.month"
                @change="tryFetchGroupEvents(payment)"
                :state="getValidationState(validationContext)" />
            </validation-provider>
          </b-col>
          <b-col v-if="!isGeneralGroupType(payment)">
            <label>Занятие</label>
            <validation-provider
              :name="'event' + index"
              :rules="{required: true}"
              v-slot="validationContext">
              <model-select
                :options="$modelsToOptions(preparedUnpayedEvents)"
                v-model="payment.event"
                :state="getValidationState(validationContext)" />
            </validation-provider>
          </b-col>
          <b-col v-if="isOncePayment(payment)">
            <label>Занятие</label>
            <validation-provider
              :name="'monthEvent' + index"
              :rules="{required: true}"
              v-slot="validationContext">
              <model-select
                :options="$modelsToOptions(getPreparedUnpayedGroupEvents(payment.monthEvents))"
                v-model="payment.event"
                :state="getValidationState(validationContext)" />
            </validation-provider>
          </b-col>
          <b-col class="col-3">
            <label>Сумма</label>
            <validation-provider
              :name="'sum' + index"
              :rules="{required: true, min: 0}"
              v-slot="validationContext">
              <b-form-input
                size="sm"
                type="number"
                v-model="payment.sum"
                :state="getValidationState(validationContext)" />
            </validation-provider>
          </b-col>
          <b-col class="col-1">
            <button
              type="button"
              class="close"
              @click="payments.splice(index,1)">
              <span aria-hidden="true">×</span>
            </button>
          </b-col>
        </b-form-row>
        <b-form-input size="sm" class="mb-1" :value="'Всего к оплате: '+ total+' руб.'" disabled></b-form-input>
        <b-input-group size="sm" class="d-flex justify-content-center">
          <b-button
            variant="outline-success"
            :hidden="addPaymentShown"
            :disabled="!payer"
            size="sm"
            @click="addPaymentShown = true">
            <b-icon icon="plus-circle-fill"></b-icon>&nbsp;
            <span>Добавить платёж</span>
          </b-button>
          <b-form-select v-model="addPaymentType" :options="filteredPaymentTypes" :hidden="!addPaymentShown"></b-form-select>
          <b-input-group-append>
            <b-button variant="outline-success" :hidden="!addPaymentShown" @click="addPayment">
              <b-icon icon="check"></b-icon>
            </b-button>
            <b-button
              variant="outline-danger"
              :hidden="!addPaymentShown"
              @click="addPaymentShown = false">
              <b-icon icon="x"></b-icon>
            </b-button>
            <b-button
              variant="success"
              :disabled="invalid || !payments.length"
              @click="sendForm">
              <span>Сохранить</span>
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form>
    </b-modal>
    </validation-observer>
  </div>
</template>

<script>
import { ModelSelect } from 'vue-search-select'
import { GroupType } from "../../../enums";

const OncePay = 10;

export default {
  components: {
    ModelSelect
  },
  props: [ "modalId", "payer", "generals", "personals", "instructors", "unpayedEvents", "unapyedGroupMonths", "isControlPanelShown" ],
  data() {
    return {
      baseUrl: "/payments",
      payments: [],
      paymentTemplates: [],
      addPaymentShown: false,
      months: [],
      paymentTypes: [
        { text: "Разовый платёж", value: OncePay },
        { text: "Общие", value: GroupType.General },
        { text: "Индивидуальные", value: GroupType.Personal }
      ],
      addPaymentType: OncePay
    };
  },
  computed: {
    total() {
      let result = 0;
      this.payments.forEach(payment => {
        if (!isNaN(payment.sum)) result += Number(payment.sum);
      });
      return result;
    },
    preparedUnpayedEvents() {
      let result = [];
      this.unpayedEvents.forEach(e => {
        let prepared = Object.assign({}, e);
        prepared.instructor = this.instructors.find(x => x.id = prepared.instructor).name;
        prepared.visitorsCount = e.visitors.length;
        prepared.name = `${this.getGroupName(prepared)} ${this.getEventDate(prepared)}`;
        result.push(prepared);
      })
      return result;
    },
    filteredPaymentTypes() {
      let result = this.paymentTypes;
      if (!this.unpayedEvents.length) {
        result = result.filter(pt => pt.value != GroupType.Personal);
      }
      return result; 
    }
  },
  mounted() {
    this.months = this.calculateMonths();
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    show() {
      this.fillTemplates();
      this.$root.$emit("bv::show::modal", this.modalId);
    },
    getPaymentDescription(payment){
      const groupName = this.getGroupName(payment); 
      const monthInfo = payment.month && !this.isOncePayment(payment) ? '('+this.getMonthName(payment.month)+')' : ''
      const event = payment.event;
      let eventInfo = '';
      if (event){
        eventInfo = this.isOncePayment(payment)
          ? this.getEventDate(payment.monthEvents.find(e => e.id == event))
          : this.getEventDate(this.unpayedEvents.find(e => e.id == event))
      }
      
      return `${groupName} ${monthInfo}${eventInfo}`;
    },
    getEventDate(event){
      return this.$moment(event.startsAt).format('DD.MM')
    },
    getGroupName(template){
      return this.isGeneralGroupType(template)
        ? this.generals.find(g => g.id == template.group).name
        : `${this.personals.find(g => g.id == template.group).name} (${template.instructor}[${template.visitorsCount} чел.])`;
    },
    isGeneralGroupType(payment){
      return payment.type == GroupType.General || payment.type == OncePay;
    },
    isOncePayment(payment){
      return payment.type == OncePay; 
    },
    getPreparedUnpayedGroupEvents(unpayedEvents) {
      let result = [];
      unpayedEvents.forEach(e => {
        let prepared = Object.assign({}, e);
        prepared.name = this.getEventDate(prepared);
        result.push(prepared);
      })
      return result;
    },
    getMonthName(month){
      if (!month) return "";
      const match = month.split(" ");
      return `${this.$moment.months()[Number(match[0])]} ${match[1]}`
    },
    async templateToPayment(template){
      const paymentsEvents = this.payments.filter(p => p.event).map(p => p.event);
      if (paymentsEvents.includes(template.event)) return;
      const paymentGroupMonth = this.payments.filter(p => p.month && p.group).map(p => `${p.month}${p.group}`);
      if (template.type == GroupType.General && paymentGroupMonth.includes(`${template.month}${template.group}`)) return;
      
      if (template.type == OncePay) {
        await this.tryFetchGroupEvents(template);
      }
      const payment = Object.assign({}, template);
      if (template.type == OncePay) {
        payment.event = payment.monthEvents.length ? payment.monthEvents[0].id : null;
      }
      this.payments.push(payment);
    },
    async addPayment() {
      let payment = {
        type: this.addPaymentType,
        month:
          this.addPaymentType == GroupType.General || this.addPaymentType == OncePay
            ? this.getCurrentMonth()
            : null,
        groups: this.getPaymentGroups(this.addPaymentType)
      };
      const firstGroup = payment.groups[0];
      payment.group = firstGroup ? firstGroup.id : null;
      payment.sum = firstGroup ? firstGroup.cost : 0;
      if (this.addPaymentType == GroupType.Personal && this.unpayedEvents.length){
        const firstEvent = this.unpayedEvents[0];
        payment.event = firstEvent ? firstEvent.id : null;
      }
      if (this.isOncePayment(payment)){
        await this.tryFetchGroupEvents(payment);
        payment.sum = firstGroup ? firstGroup.onceCost : 0;
      }
      this.payments.push(payment);
      this.addPaymentShown = false;
    },
    getCurrentMonth() {
      let date = new Date();
      return `${date.getMonth()} ${date.getFullYear()}`;
    },
    getPaymentGroups(type) {
      return type == GroupType.General || type == OncePay
        ? this.generals.sort(this.sortByPayerInMembers) 
        : this.personals.sort(this.sortByPayerInMembers);
    },
    sortByPayerInMembers(a, b) {
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    },
    async tryFetchGroupEvents(payment){
      if (!this.isOncePayment(payment)) return;
      const match = payment.month ? payment.month.split(" ") : null;
      if (!match) return;
      payment.event = null;
      let query = {
        group: payment.group,
        month: match[0],
        year: match[1]
      };
      query.person = this.payer;
      payment.monthEvents = await this.$getAsync(`${this.baseUrl}/group-unpayed-events`, query);
    },
    async sendForm(){
      const result = await this.$postAsync(
        `${this.baseUrl}/create-all`, 
        this.getPreparedPayments(), 
        true);
      if (result != "OK") {
        return;
      }
      this.$root.$emit("bv::hide::modal", this.modalId);
      this.$bvToast.toast('Статус запроса: ' + result, {
        title: 'Платежи успешно сохранены',
        variant: 'success',
        autoHideDelay: 3000,
        solid: true
      });
      this.resetForm();
      this.$emit("formSaved");
    },
    getPreparedPayments(){
      let resultPayments = [];
      this.payments.forEach(p => {
        const match = p.month && p.type == GroupType.General ? p.month.split(" ") : null;
        const month = match ? Number(match[0]) : null;
        const year = match ? Number(match[1]) : null;
        let payment = {
          group: p.group,
          sum: p.sum,
          month: month,
          year: year
        };
        if (p.event) {
          payment.events = [p.event];
          payment.group = p.group; 
        }
        let description = `Оплата ${this.getPaymentDescription(p)} `;
        payment.person = this.payer;
        payment.description = description;
        resultPayments.push(payment);
      });
      return resultPayments;
    },
    tryAddTemplate(template) {
      if (template.type == GroupType.General && this.paymentTemplates
        .map(x => `${x.type}${x.group}${x.month}`)
        .includes(`${template.type}${template.group}${template.month}`)) return;
      this.paymentTemplates.push(template);
    },
    fillTemplates(){
      this.paymentTemplates = [];
      this.generals.forEach(g => {
        if (!g.members.includes(this.payer)) return;
        this.tryAddTemplate({
          type: GroupType.General,
          month: this.getNextMonth(),
          groups: this.getPaymentGroups(GroupType.General),
          group: g.id,
          sum: g.cost
        });
      })
      this.unapyedGroupMonths.forEach(g => {
        this.tryAddTemplate({
          type: GroupType.General,
          month: `${g.month} ${g.year}`,
          groups: this.getPaymentGroups(GroupType.General),
          group: g.group,
          sum: this.generals.find(x => x.id == g.group).cost
        });
        this.tryAddTemplate({
          type: OncePay,
          month: `${g.month} ${g.year}`,
          groups: this.getPaymentGroups(GroupType.General),
          group: g.group,
          sum: this.generals.find(x => x.id == g.group).onceCost
        });
      })
      this.unpayedEvents.forEach(e => {
        const groups = this.getPaymentGroups(GroupType.Personal);
        const group = groups.find(g => g.id == e.group);
        if (!group.members.includes(this.payer)) return;
        const instructor = this.instructors.find(i => i.id == e.instructor);
        const prices = instructor.prices;
        const countPrice = prices.find(x => x.count == e.visitors.length) || prices[prices.length - 1];
        const sum = countPrice.price;
        this.tryAddTemplate({
          type: group.type,
          month: null,
          groups: groups,
          group: group.id,
          sum: sum,
          instructor: instructor.name,
          visitorsCount: e.visitors.length,
          event: e.id
        });
      })
    },
    getNextMonth() {
      let date = new Date();
      let day = date.getDate();
      date.setMonth(date.getMonth() + 1);
      if (date.getDate() != day) {
        date.setDate(0);
      }
      return `${date.getMonth()} ${date.getFullYear()}`;
    },
    calculateMonths() {
      for (let i = -6; i <= 6; i++) {
        let date = new Date();
        let day = date.getDate();
        date.setMonth(date.getMonth() + i);
        if (date.getDate() != day) {
          date.setDate(0);
        }
        const month = `${date.getMonth()} ${date.getFullYear()}`; 
        this.months.push({
          text: this.getMonthName(month),
          value: month
        });
      }
      return this.months;
    },
    resetForm() {
      this.payments = [];
      this.paymentTemplates = [];
      this.$nextTick(() => {
        this.$refs.observer.reset();
      });
    }
  }
};
</script>