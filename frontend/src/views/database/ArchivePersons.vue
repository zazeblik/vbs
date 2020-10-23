<template>
  <b-container fluid class="py-2">
    <h5>Участники в архиве</h5>
    <DataTable 
      :baseUrl="baseUrl" 
      :fields="fields" 
      :itemForm="itemForm" 
      filterPlaceHolder="Введите имя..." 
      :creationErrorMessage="creationErrorMessage" /> 
  </b-container>
</template>

<script>
import DataTable from "../../components/DataTable";
import { ArchivePersonForm } from "../../shared/forms";
export default {
  data() {
    return {
      baseUrl: "/archivepersons",
      itemForm: ArchivePersonForm,
      creationErrorMessage: null,
      fields: [
        {
          key: "person",
          label: "Участник",
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
      this.itemForm.find(f => f.property == "person").models = settings.persons;
      this.itemForm.find(f => f.property == "group").models = settings.groups;
      if (settings.persons.length == 0 || settings.groups.length == 0) {
        this.creationErrorMessage = "Для создания записи необходимо создать хотябы одного участника и хотябы одну группу";
      }
    },
  }
};
</script>