<template>
  <b-container fluid class="py-2">
    <h5>Участники</h5>
    <DataTable :baseUrl="baseUrl" :fields="fields" :itemForm="itemForm" filterPlaceHolder="Введите имя..." />
  </b-container>
</template>

<script>
import DataTable from "../../components/DataTable";
import { PersonForm } from "../../shared/forms";
export default {
  data() {
    const self= this;
    return {
      baseUrl: "/persons",
      itemForm: PersonForm,
      fields: [
        {
          key: "name",
          label: "Фамилия Имя",
          sortable: true
        },
        {
          key: "birthday",
          label: "Дата рождения",
          sortable: true,
          formatter: function (value) {
            return value ? self.$moment(value).format("DD.MM.YYYY") : null;
          }
        },
        {
          key: "updater",
          label: "Обновил",
          formatter: (value, key, item) => {
            if (!value) return "";
            return value.login;
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