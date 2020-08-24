<template>
  <b-container fluid class="py-2">
    <h5>Учётные записи</h5>
    <DataTable :baseUrl="baseUrl" :fields="fields" :itemForm="itemForm" filterPlaceHolder="Введите логин..." />
  </b-container>
</template>

<script>
import DataTable from "../../components/DataTable";
import { UserForm } from "../../shared/forms";
export default {
  data() {
    return {
      baseUrl: "/users",
      itemForm: UserForm,
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
      ]
    };
  },
  components: {
    DataTable
  },
  async mounted(){
    await this.fetchSettings();
  },
  methods: {
    async fetchSettings() {
      const settings = await this.$getAsync(`${this.baseUrl}/settings`);
      this.itemForm.find(f => f.property == "person").models = settings.persons;
    },
  }
};
</script>