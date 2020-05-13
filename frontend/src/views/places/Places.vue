<template>
  <b-container fluid class="py-2">
    <h5>Залы</h5>
    <DataTable :baseUrl="baseUrl" :fields="fields" :itemForm="itemForm" filterPlaceHolder="Введите название..." />
  </b-container>
</template>

<script>
import DataTable from "../../components/DataTable";
import { PlaceForm } from "../../shared/forms";
export default {
  data() {
    return {
      baseUrl: "/places",
      itemForm: PlaceForm,
      fields: [
        {
          key: "name",
          label: "Наименование",
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