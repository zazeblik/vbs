<template>
  <div class="py-2">
    <h5>Учётные записи</h5>
    <DataTable
      :baseUrl="baseUrl"
      :fields="fields"
      :itemForm="itemForm"
      filterPlaceHolder="Введите логин..."
      :additionalButtons="additionalButtons"
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
      additionalButtons: null,
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
          key: "password",
          label: "Пароль",
          formatter: (value, key, item) => {
            if (!value) return "***";
            return value.name;
          }
        },
        {
          key: "instructor",
          label: "Тренер",
          formatter: (value, key, item) => {
            if (!value) return "";
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
    this.additionalButtons = [];
    this.passwordShowButton = { getPassword: this.getPassword };
    await this.fetchSettings();
  },
  methods: {
    async getPassword(userId) {
      const response = await this.$getAsync(`${this.baseUrl}/get-password`, { id: userId })
      return response.data;
    },
    async fetchSettings() {
      const settings = await this.$getAsync(`${this.baseUrl}/settings`);
      this.itemForm.find(f => f.property == "instructor").models = settings.instructors;
    }
  }
};
</script>