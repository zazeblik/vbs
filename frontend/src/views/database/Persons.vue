<template>
  <div class="py-2">
    <div class="d-flex justify-content-between">
      <h5>Участники</h5>
      <b-button-group size="sm">
        <b-button variant="link" class="additional-btn" @click="importExcel">
          <b-icon icon="file-earmark-arrow-up"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Импорт</span>
        </b-button>
        <b-button variant="link" class="additional-btn" @click="exportExcel">
          <b-icon icon="file-earmark-arrow-down"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Экспорт</span>
        </b-button>
        <b-button variant="link" class="additional-btn" @click="showCustomFieldsModal">
          <b-icon icon="clipboard-plus"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Добавочные поля</span>
        </b-button>
      </b-button-group>
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
      itemForm: Object.assign([], PersonForm),
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
  methods: {
    async fetchPage(){
      this.$refs.dataTable.fetchTable();
    },
    showCustomFieldsModal(){
      this.$refs.customFieldsModal.show();
    },
    importExcel(){
      this.$refs.dataTable.$refs.fileInput.$el.childNodes[0].click();
    },
    async exportExcel(){
      await this.$getAsync(`${this.baseUrl}/export`, {}, true);
    }
  }
};
</script>

<style scoped>
.additional-btn {
  text-decoration: none;
}
</style>