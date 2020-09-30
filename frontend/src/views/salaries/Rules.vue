<template>
  <b-container fluid class="py-2">
    <h5>Правила рассчёта зарплат</h5>
    <DataTable :baseUrl="baseUrl" :fields="fields" :itemForm="itemForm" :hideSearch="true"  />
  </b-container>
</template>

<script>
import DataTable from "../../components/DataTable";
import { RuleForm } from "../../shared/forms";
export default {
  data() {
    return {
      baseUrl: "/salaryrules",
      itemForm: RuleForm,
      fields: [
        {
          key: "instructor",
          label: "Тренер",
          formatter: (value, key, item) => {
            if (!value) return "";
            return value.name;
          }
        },
        {
          key: "group",
          label: "Группа",
          formatter: (value, key, item) => {
            if (!value) return "";
            return value.name;
          }
        },
        {
          key: "type",
          label: "Тип",
          sortable: true,
          formatter: (value, key, item) => {
            const field = RuleForm.find(f => f.property == "type");
            return field.options.find(o => o.value == value).text;
          }
        },
        {
          key: "value",
          label: "Значение",
          sortable: true
        },
        {
          key: "forPersonalGroups",
          label: "Для индивидуальных групп",
          type: "checkbox",
          sortable: true,
          formatter: (value, key, item) => {
            return value ? "Да" : "Нет";
          }
        },
        {
          key: "updater",
          label: "Обновил",
          formatter: (value, key, item) => {
            if (!value) return "";
            return value.login;
          }
        }
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
      this.itemForm.find(f => f.property == "instructor").models = settings.instructors;
      this.itemForm.find(f => f.property == "group").models = settings.groups;
    },
  }
};
</script>