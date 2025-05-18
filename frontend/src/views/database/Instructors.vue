<template>
  <div class="py-2">
    <h5>Тренеры</h5>
    <DataTable :baseUrl="baseUrl" :fields="fields" :itemForm="itemForm" filterPlaceHolder="Введите фамилию и имя..." />
  </div>
</template>

<script>
import DataTable from "../../components/DataTable";
import { InstructorForm } from "../../shared/forms";
export default {
  data() {
    return {
      baseUrl: "/instructors",
      itemForm: Object.assign([], InstructorForm),
      fields: [
        {
          key: "name",
          label: "Фамилия Имя",
          sortable: true
        },
        {
          key: "color",
          label: "Цвет",
          sortable: true,
          tdAttr: (value, key, item) => { return { style: "background:"+value } },
          formatter: () => ""
        }
      ]
    };
  },
  components: {
    DataTable
  }
};
</script>