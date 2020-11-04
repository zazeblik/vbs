<template>
  <div class="py-2">
    <div class="d-flex justify-content-between">
      <h5>Участники</h5>
      <b-button
        size="sm"
        variant="link"
        class="add-fields-btn"
        @click="showCustomFieldsModal"
      >
        <b-icon icon="clipboard-plus"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Добавочные поля</span>
      </b-button>
    </div>
    <DataTable 
      ref="dataTable" 
      :baseUrl="baseUrl" 
      :fields="fields"
      :itemForm="itemForm"
      :additionalButtons="additionalButtons"
      filterPlaceHolder="Введите имя..."
      :hasCustomFields="true" />
    <CustomFieldsModal 
      modalId="customFieldsModal"
      ref="customFieldsModal"
      :fields="customFields"
      @formSaved="fetchPage" />
  </div>
</template>

<script>
import DataTable from "../../components/DataTable";
import { PersonForm } from "../../shared/forms";
import CustomFieldsModal from "../../components/CustomFieldsModal";

export default {
  data() {
    const self= this;
    return {
      baseUrl: "/persons",
      itemForm: PersonForm,
      customFields: [],
      additionalButtons: [],
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
    DataTable,
    CustomFieldsModal
  },
  async mounted() {
    this.additionalButtons = [
      // { name: 'Импорт', action: this.import, icon: 'file-earmark-arrow-up' }, 
      // { name: 'Экспорт', action: this.export, icon: 'file-earmark-arrow-down' }
    ];
  },
  methods: {
    async fetchPage(){
      this.$refs.dataTable.fetchTable();
    },
    showCustomFieldsModal(){
      this.$refs.customFieldsModal.show();
    },
    import(){
      console.log("import");
    },
    export(){
      console.log("export");
    }
  }
};
</script>

<style scoped>
.add-fields-btn {
  text-decoration: none;
}
</style>