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
                v-model="payment.group"
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
            <b-button variant="outline-success" :hidden="!addPaymentShown" @click="addPayment()">
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
              :disabled="invalid || !payments.length || isDublicateExist"
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
export default {
  components: {
    ModelSelect
  },
  props: [ "modalId", "payer", "generals", "personals", "unpayedEvents" ],
  data() {
    return {
      baseUrl: "/payments",
      payments: [],
      paymentTemplates: [],
      addPaymentShown: false,
      months: [],
      paymentTypes: [
        { text: "Общие", value: GroupType.General },
        { text: "Индивидуальные", value: GroupType.Personal }
      ],
      addPaymentType: GroupType.General
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
    filteredPaymentTypes() {
      let result = this.paymentTypes;
      if (!this.unpayedEvents.length) {
        result = result.filter(pt => pt.value != GroupType.Personal);
      }
      return result; 
    },
    preparedUnpayedEvents() {
      let result = [];
      this.unpayedEvents.forEach(e => {
        let prepared = Object.assign({}, e);
        prepared.name = `${this.getGroupName(prepared)} ${this.$moment(prepared.startsAt).format('DD.MM')}`;
        result.push(prepared);
      })
      return result;
    },
    isDublicateExist() {
      return false;
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
      const event = payment.event;
      return `${this.getGroupName(payment)} ${payment.month ? '('+this.getMonthName(payment.month)+')' : ''}`+
        `${event ? this.$moment(this.unpayedEvents.find(e => e.id == event).startsAt).format('DD.MM') : ''}`
    },
    getGroupName(template){
      return this.isGeneralGroupType(template) 
        ? this.generals.find(g => g.id == template.group).name
        : this.personals.find(g => g.id == template.group).name;
    },
    isGeneralGroupType(payment){
      return payment.type == GroupType.General; 
    },
    getMonthName(month){
      if (!month) return "";
      const match = month.split(" ");
      return `${this.$moment.months()[Number(match[0])]} ${match[1]}`
    },
    templateToPayment(template, index){
      const paymentsEvents = this.payments.filter(p => p.event).map(p => event);
      if (paymentsEvents.includes(template.event)) return;
      const paymentGroupMonth = this.payments.filter(p => p.month && p.group).map(p => `${p.month}${p.group}`);
      if (paymentGroupMonth.includes(`${template.month}${template.group}`)) return;
      this.payments.push(Object.assign({}, template));
    },
    addPayment() {
      let payment = {
        type: this.addPaymentType,
        month:
          this.addPaymentType == GroupType.General
            ? this.getCurrentMonth()
            : null,
        groups: this.getPaymentGroups(this.addPaymentType)
      };
      const firstGroup = payment.groups[0];
      payment.group = firstGroup ? firstGroup.id : null;
      payment.sum = firstGroup ? firstGroup.cost : 0;
      if (this.addPaymentType == GroupType.Personal){
        const firstEvent = this.unpayedEvents[0];
        payment.event = firstEvent ? firstEvent.id : null;
      }
      this.payments.push(payment);
      this.addPaymentShown = false;
    },
    getCurrentMonth() {
      let date = new Date();
      return `${date.getMonth()} ${date.getFullYear()}`;
    },
    getPaymentGroups(type) {
      return type == GroupType.General 
        ? this.generals.sort(this.sortByPayerInMembers) 
        : this.personals.sort(this.sortByPayerInMembers);
    },
    sortByPayerInMembers(a, b) {
      const aIsIncludes = a.members.includes(this.payer);
      const bIsIncludes = b.members.includes(this.payer);
      if (a < b) return -1;
      if (a > b) return 1;
      return 0;
    },
    async sendForm(){
      const result = await this.$postAsync(`${this.baseUrl}/create-all`, this.getPreparedPayments(), true);
      if (result != "OK") {
        return;
      }
      this.$root.$emit("bv::hide::modal", this.modalId);
      this.$bvToast.toast('Сохранено платежей: ' + this.payments.length, {
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
        const match = p.month ? p.month.split(" ") : null;
        const month = match ? Number(match[0]) : null;
        const year = match ? Number(match[1]) : null;
        let payment = {
          person: this.payer,
          group: p.group,
          sum: p.sum,
          month: month,
          description: `Оплата ${this.getPaymentDescription(p)} вручную`,
          year: year
        };
        if (p.event) {
          payment.events = [p.event];
        }
        resultPayments.push(payment);
      });
      return resultPayments;
    },
    fillTemplates(){
      this.paymentTemplates = [];
      this.generals.forEach(g => {
        if (!g.members.includes(this.payer)) return;
        this.paymentTemplates.push({
          type: GroupType.General,
          month: this.getNextMonth(),
          groups: this.getPaymentGroups(GroupType.General),
          group: g.id,
          sum: g.cost
        })
      })
      const personals = this.getPaymentGroups(GroupType.Personal);
      this.unpayedEvents.forEach(e => {
        const group = personals.find( g => g.id == e.group);
        if (!group.members.includes(this.payer)) return;
        this.paymentTemplates.push({
          type: GroupType.Personal,
          month: null,
          groups: personals,
          group: group.id,
          sum: group.cost,
          event: e.id
        })
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