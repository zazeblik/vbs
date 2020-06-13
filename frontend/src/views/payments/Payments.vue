<template>
  <b-container fluid class="py-2">
    <h5>История</h5>
    <b-input-group prepend="Участник" size="sm">
      <b-form-select v-model="payer" :options="$modelsToOptions(persons)"></b-form-select>
      <b-form-input 
        min="0" 
        type="number" 
        v-model="incomeSum"
        :hidden="!addIncomeShown" />
      <b-input-group-append>
        <b-button variant="outline-success" :hidden="addIncomeShown" @click="addIncomeShown = true">
          <b-iconstack>
            <b-icon stacked icon="plus-circle-fill" shift-h="4" shift-v="-2" scale="0.6"></b-icon>
            <b-icon stacked icon="credit-card"></b-icon>
          </b-iconstack>
          &nbsp;
          <span class="d-none d-md-inline-block">Пополнить баланс</span>
        </b-button>
        <b-button variant="outline-success" :disabled="incomeSum <= 0" :hidden="!addIncomeShown" @click="addIncome">
          <b-icon icon="check"></b-icon>
        </b-button>
        <b-button variant="outline-danger" :hidden="!addIncomeShown" @click="addIncomeShown = false">
          <b-icon icon="x"></b-icon>
        </b-button>
        <b-button variant="outline-primary" @click="addPaymentsModalShow">
          <b-iconstack>
            <b-icon stacked icon="dash-circle-fill" shift-h="4" shift-v="-2" scale="0.6"></b-icon>
            <b-icon stacked icon="credit-card"></b-icon>
          </b-iconstack>
          &nbsp;
          <span class="d-none d-md-inline-block">Оплатить занятия</span>
        </b-button>
        <b-button variant="outline-success" @click="addPersonModalShow">
          <b-icon icon="person-plus-fill"></b-icon>
          &nbsp;
          <span class="d-none d-md-inline-block">Добавить участника</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-input-group size="sm">
      <b-form-input :value="`Баланс: ${balance} руб.`" disabled />
      <div class="limit-arrow px-2" is-text>&darr;</div>
      <b-form-select class="col-2" v-model="limit" :options="limits" />
    </b-input-group>
    <b-list-group>
      <b-list-group-item
        class="p-2"
        v-for="transaction in transactions"
        :key="`transaction_${transaction.type}_${transaction.id}`"
        :variant="isIncome(transaction.type) ? 'success' : ''" >
        <div>
          <b v-if="isIncome(transaction.type)">{{transaction.sum > 0 ? '+' : ''}}{{transaction.sum}}</b>
          <b v-else>{{transaction.sum > 0 ? '-' : ''}}{{transaction.sum}}</b>
          &nbsp;
          <span>{{transaction.description}}</span>
        </div>
        <small>{{$moment(transaction.updatedAt).format("DD.MM.YYYY HH:mm")}}</small>
        <b-dropdown dropleft class="dropdown-actions" variant="link" toggle-class="text-decoration-none" no-caret>
          <template v-slot:button-content>
            <b-icon icon="three-dots-vertical"/><span class="sr-only">Actions</span>
          </template>
          <b-dropdown-item @click="showEditTransactionModal(transaction)">Редактировать</b-dropdown-item>
          <b-dropdown-item @click="showRemoveTransactionConfirm(transaction)">Удалить</b-dropdown-item>
        </b-dropdown>
      </b-list-group-item>
    </b-list-group>
    <ModelModal 
      modalId="personModal" 
      :baseUrl="personUrl" 
      :itemForm="personForm" 
      ref="personModal" 
      @formSaved="fetchSettings" />
    <ModelModal 
      modalId="editPaymentModal" 
      :baseUrl="baseUrl" 
      :itemForm="paymentForm" 
      ref="editPaymentModal" 
      @formSaved="fetchPage" />
    <ModelModal 
      modalId="editIncomeModal" 
      :baseUrl="incomeUrl" 
      :itemForm="incomeForm" 
      ref="editIncomeModal" 
      @formSaved="fetchPage" />
    <PaymentsModal 
      modalId="paymentsModal"
      ref="paymentsModal" 
      :generals="generals"
      :personals="personals"
      :unpayedEvents="personalUnpayedEvents"
      :payer="payer" 
      @formSaved="fetchPage" />
  </b-container>
</template>

<script>
import ModelModal from "../../components/ModelModal";
import PaymentsModal from "../../components/PaymentsModal";
import { ModelSelect } from "vue-search-select";
import { GroupType, TransactionType } from "../../../../enums";
import { PersonForm, PaymentForm, IncomeForm } from "../../shared/forms";
export default {
  components: {
    ModelSelect,
    ModelModal,
    PaymentsModal
  },
  data() {
    return {
      baseUrl: "/payments",
      personUrl: "/persons",
      incomeUrl: "/incomes",
      persons: [],
      generals: [],
      personals: [],
      unpayedEvents: {},
      personalUnpayedEvents: [],
      personForm: PersonForm,
      paymentForm: PaymentForm,
      incomeForm: IncomeForm,
      addIncomeShown: false,
      payer: null,
      incomeSum: 0,
      balance: 0,
      transactions: [],
      limit: 25,
      limits: [25, 50, 100, 200]
    };
  },
  async mounted() {
    await this.fetchPage();
  },
  watch: {
    payer(val) {
      this.updatePayer();
      this.resetIncomeForm();
      this.fetchTransactions();
    },
    limit(val) {
      this.fetchTransactions();
    }
  },
  methods: {
    async fetchPage(){
      await this.fetchSettings();
      if (!this.payer) return;
      await this.fetchTransactions();
    },
    async fetchSettings() {
      const settings = await this.$getAsync(`${this.baseUrl}/settings`);
      this.persons = settings.persons;
      this.generals = settings.generals;
      this.personals = settings.personals;
      this.unpayedEvents = settings.unpayedEvents;
      if (!this.persons.length) return;
      if (!this.payer) this.payer = this.persons[0].id;
      this.updatePayer();
    },
    async fetchTransactions() {
      this.transactions = await this.$getAsync(`${this.baseUrl}/transactions`, { 
        person: this.payer, 
        limit: this.limit 
      }); 
    },
    updatePayer() {
      this.balance = this.persons.find(p => p.id == this.payer).balance;
      this.personalUnpayedEvents = this.unpayedEvents[this.payer];
    },
    async addIncome(){
      await this.$postAsync(`${this.incomeUrl}/create`, {
        sum: this.incomeSum,
        person: this.payer
      });
      this.resetIncomeForm();
      await this.fetchPage();
    },
    async showRemoveTransactionConfirm(transaction) {
      try {
        const confirm = await this.$bvModal.msgBoxConfirm(
          `Вы уверены, что хотите удалить ${transaction.description}?`,
          {
            cancelTitle: "Отмена",
            cancelVariant: "outline-secondary",
            okTitle: "Удалить",
            okVariant: "danger"
          }
        );
        if (!confirm) return;
        await this.removeTransaction(transaction);
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    },
    async removeTransaction(transaction) {
      await this.$postAsync(`/${this.isIncome(transaction.type) ? 'incomes' : 'payments'}/delete/${transaction.id}`);
      await this.fetchPage();
    },
    isIncome( type ){
      return type == TransactionType.Income;
    },
    resetIncomeForm(){
      this.addIncomeShown = false;
      this.incomeSum = 0;
    },
    addPersonModalShow(){
      this.$refs.personModal.showAdd();
    },
    showEditTransactionModal(transaction){
      if (this.isIncome(transaction.type)){
        this.$refs.editIncomeModal.showEdit(transaction);
      } else {
        this.$refs.editPaymentModal.showEdit(transaction);
      }
    },
    addPaymentsModalShow(){
      this.$refs.paymentsModal.show();
    }
  }
};
</script>

<style scoped>
form {
  font-size: small;
}
.limit-arrow {
  background: #e9ecef !important;
}

.dropdown-actions {
  margin-top: -1.5rem;
}
</style>