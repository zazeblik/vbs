<template>
  <b-container fluid class="py-2">
    <h5>Материалы</h5>
    <DataTable :baseUrl="baseUrl" :fields="fields" :itemForm="itemForm" filterPlaceHolder="Введите название..." />
  </b-container>
</template>

<script>
import DataTable from "../../components/DataTable";
import { MaterialForm } from "../../shared/forms";
export default {
  data() {
    return {
      baseUrl: "/materials",
      itemForm: MaterialForm,
      fields: [
        {
          key: "name",
          label: "Наименование",
          sortable: true
        },
        {
          key: "block",
          label: "Блок",
          sortable: true,
          formatter: (value, key, item) => {
            const field = MaterialForm.find(f => f.property == "block");
            return field.options.find(o => o.value == value).text;
          }
        },
        { key: "actions", label: "Подробнее" }
      ]
    };
  },
  components: {
    DataTable
  }
};
</script>