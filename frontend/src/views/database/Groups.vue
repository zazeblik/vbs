<template>
  <div class="py-2">
    <h5>Группы</h5>
    <DataTable 
      :baseUrl="baseUrl" 
      :fields="fields" 
      :itemForm="itemForm" 
      filterPlaceHolder="Введите название..." 
      :creationErrorMessage="creationErrorMessage"
      ref="dataTable" />
  </div>
</template>

<script>
import DataTable from "../../components/DataTable";
import { GroupForm } from "../../shared/forms";
export default {
  data() {
    return {
      baseUrl: "/groups",
      itemForm: Object.assign([], GroupForm),
      creationErrorMessage: null,
      fields: [
        {
          key: "name",
          label: "Название",
          sortable: true
        },
        {
          key: "type",
          label: "Тип",
          sortable: true,
          formatter: (value, key, item) => {
            const field = GroupForm.find(f => f.property == "type");
            return field.options.find(o => o.value == value).text;
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
  },
  async mounted(){
    await this.fetchSettings();
  },
  methods: {
    async fetchSettings() {
      const settings = await this.$getAsync(`${this.baseUrl}/settings`);
      if (settings.persons.length == 0 || settings.instructors.length == 0) {
        this.creationErrorMessage = "Для создания группы необходимо создать хотябы одного участника и хотябы одного тренера";
      }
      this.itemForm.find(f => f.property == "defaultInstructor").models = settings.instructors;
      this.itemForm.find(f => f.property == "hidden").hidden = false;
      this.itemForm.find(f => f.property == "type").hidden = false;
    }
  }
};
</script>