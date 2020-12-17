<template>
  <div class="py-2">
    <h5>Файлы</h5>
    <DataTable :baseUrl="baseUrl" :fields="fields" :itemForm="itemForm" filterPlaceHolder="Введите название..." />
  </div>
</template>

<script>
import DataTable from "../../components/DataTable";
import { FileForm } from "../../shared/forms";
export default {
  data() {
    return {
      baseUrl: "/files",
      itemForm: Object.assign([], FileForm),
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
            const field = FileForm.find(f => f.property == "block");
            return field.options.find(o => o.value == value).text;
          }
        },
        {
          key: "file",
          label: "Файл"
        }
      ]
    };
  },
  components: {
    DataTable
  }
};
</script>