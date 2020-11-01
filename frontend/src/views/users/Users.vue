<template>
  <div class="py-2">
    <h5>Учётные записи</h5>
    <DataTable
      :baseUrl="baseUrl"
      :fields="fields"
      :itemForm="itemForm"
      filterPlaceHolder="Введите логин..."
      :additionalButton="additionalButton"
      :passwordShowButton="passwordShowButton"
      ref="dataTable" />
  </div>
</template>

<script>
import DataTable from "../../components/DataTable";
import { UserForm } from "../../shared/forms";
export default {
  data() {
    return {
      baseUrl: "/users",
      itemForm: UserForm,
      additionalButton: null,
      passwordShowButton: null,
      fields: [
        {
          key: "login",
          label: "Логин",
          sortable: true
        },
        {
          key: "role",
          label: "Роль",
          sortable: true,
          formatter: (value, key, item) => {
            const field = UserForm.find(f => f.property == "role");
            return field.options.find(o => o.value == value).text;
          }
        },
        {
          key: "person",
          label: "Участник",
          formatter: (value, key, item) => {
            if (!value) return "";
            return value.name;
          }
        },
        {
          key: "password",
          label: "Пароль",
          formatter: (value, key, item) => {
            if (!value) return "***";
            return value.name;
          }
        },
      ]
    };
  },
  components: {
    DataTable
  },
  async mounted(){
    this.additionalButton = { name: 'Сгенерировать', action: this.syncAccounts };
    this.passwordShowButton = { getPassword: this.getPassword };
    await this.fetchSettings();
  },
  methods: {
    async fetchSettings() {
      const settings = await this.$getAsync(`${this.baseUrl}/settings`);
      this.itemForm.find(f => f.property == "person").models = settings.persons;
    },
    async syncAccounts() {
      await this.$getAsync(`${this.baseUrl}/generate`);
      await this.$refs.dataTable.fetchTable();
    },
    async getPassword(userId) {
      const response = await this.$getAsync(`${this.baseUrl}/get-password`, { id: userId })
      return response.data;
    }
  }
};
</script>