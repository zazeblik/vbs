<template>
  <b-container class="py-2">
    <h5>Приём платежей</h5>
    <validation-observer ref="observer" v-slot="{ invalid }">
      <b-form class="pt-2">
        <validation-provider name="payer" :rules="{required: true}" v-slot="validationContext">
          <b-form-group label="Участник" label-cols-sm="2">
            <model-select
              :options="$modelsToOptions(persons)"
              v-model="payer"
              :state="getValidationState(validationContext)" />
          </b-form-group>
        </validation-provider>
        <b-form-group label="Шаблоны" :hidden="!payer" label-cols-sm="2">
          <b-list-group>
            <b-list-group-item 
              class="py-1 px-2"
              v-for="(template, index) in paymentTemplates" 
              :key="'template'+index">
              {{getGroupName(template)}} {{template.month ? `(${getMonthName(template.month)})` : ''}} - {{template.sum}} руб.
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
          <b-col>
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
          <b-input-group-prepend>
            <b-button
              variant="outline-success"
              :hidden="addPaymentShown"
              :disabled="!payer"
              @click="addPaymentShown = true">
              <b-icon icon="plus-circle-fill"></b-icon>&nbsp;
              <span>Добавить платёж</span>
            </b-button>
          </b-input-group-prepend>
          <b-form-select v-model="addPaymentType" :options="paymentTypes" :hidden="!addPaymentShown"></b-form-select>
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
              variant="outline-success" 
              :disabled="invalid || !payments.length"
              @click="sendForm()">
              <b-icon icon="check-circle"></b-icon>&nbsp;
              <span>Сохранить</span>
            </b-button>
          </b-input-group-append>
        </b-input-group>
      </b-form>
    </validation-observer>
  </b-container>
</template>

<script>
import { ModelSelect } from "vue-search-select";
import { GroupType } from "../../../../enums";
export default {
  components: {
    ModelSelect
  },
  data() {
    return {
      baseUrl: "/payments",
      persons: [],
      generals: [],
      personals: [],
      months: [],
      addPaymentShown: false,
      addPaymentType: GroupType.Personal,
      payer: null,
      paymentTypes: [
        { text: "Общие", value: GroupType.General },
        { text: "Индивидуальные", value: GroupType.Personal }
      ],
      payments: [],
      paymentTemplates: []
    };
  },
  computed: {
    total() {
      let result = 0;
      this.payments.forEach(payment => {
        if (!isNaN(payment.sum)) result += Number(payment.sum);
      });
      return result;
    }
  },
  async mounted() {
    this.months = this.calculateMonths();
    await this.fetchSettings();
  },
  watch: {
    payer(val) {
      this.payments = [];
      this.fillTemplates();
    }
  },
  methods: {
    async fetchSettings() {
      const settings = await this.$getAsync(`${this.baseUrl}/settings`);
      this.persons = settings.persons;
      this.generals = settings.groups.filter(g => g.type == GroupType.General);
      this.personals = settings.groups.filter(g => g.type == GroupType.Personal);
    },
    async sendForm(){
      this.payments = [];
      this.fillTemplates();
    },
    isGeneralGroupType(payment){
      return payment.type == GroupType.General; 
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
      this.personals.forEach(g => {
        if (!g.members.includes(this.payer)) return;
        this.paymentTemplates.push({
          type: GroupType.Personal,
          month: null,
          groups: this.getPaymentGroups(GroupType.Personal),
          group: g.id,
          sum: g.cost
        })
      })
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    templateToPayment(template, index){
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
      this.payments.push(payment);
      this.addPaymentShown = false;
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
    getGroupName(template){
      return this.isGeneralGroupType(template) 
        ? this.generals.find(g => g.id == template.group).name
        : this.personals.find(g => g.id == template.group).name;
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
    getCurrentMonth() {
      let date = new Date();
      return `${date.getMonth()} ${date.getFullYear()}`;
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
    getMonthName(month){
      if (!month) return "";
      const match = month.split(" ");
      return `${this.$moment.months()[Number(match[0])]} ${match[1]}`
    }
  }
};
</script>

<style scoped>
form {
  font-size: small;
}
</style>