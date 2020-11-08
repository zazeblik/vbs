<template>
  <div>
    <b-button-toolbar justify>
      <b-input-group size="sm">
        <b-input-group-prepend is-text>
          <b-form-checkbox v-model="selectAll" class="select-all-checkbox"/>
        </b-input-group-prepend>
        <b-button-group size="sm">
          <b-button variant="outline-success" @click="showAddModal">
            <b-icon icon="plus-circle-fill"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Добавить</span>
          </b-button>
          <b-button
            variant="outline-danger"
            :disabled="selected.length == 0"
            @click="showDeleteConfirm"
          >
            <b-icon icon="trash"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Удалить</span>
          </b-button>
          <b-button
            v-for="(additionalButton, key) in additionalButtons"
            :key="key"
            :variant="`outline-${additionalButton.variant || 'primary'}`"
            @click="additionalButton.action"
          >
            <b-icon :icon="additionalButton.icon || 'caret-right'"></b-icon>&nbsp;<span class="d-none d-md-inline-block">{{additionalButton.name || 'Кнопка'}}</span>
          </b-button>
        </b-button-group>
        <b-form-file v-show="false" accept=".xlsx" v-model="importedFile" ref="fileInput" @change="importFile"></b-form-file>
      </b-input-group>
      
      <b-input-group size="sm" v-if="!hideSearch">
        <b-input-group-prepend is-text>
          <b-icon icon="search"></b-icon>
        </b-input-group-prepend>
        <b-form-input
          v-model="filter"
          type="search"
          id="filterInput"
          :placeholder="filterPlaceHolder"
          @change="fetchTable"
        />
      </b-input-group>
      <b-input-group prepend="Показывать по" :append="'Всего: '+total" size="sm">
        <b-form-select
          v-model="perPage"
          id="perPageSelect"
          size="sm"
          :options="pageOptions"
          @change="fetchTable"
        />
        <b-pagination
          v-model="currentPage"
          :total-rows="total"
          :per-page="perPage"
          align="fill"
          size="sm"
          class="my-0 mx-1"
          @input="fetchTable"
        />
      </b-input-group>
    </b-button-toolbar>
    <b-table
      show-empty
      small
      responsive="sm"
      :items="items"
      :fields="fields"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      ref="selectableTable"
      selectable
      @row-selected="onRowSelected"
      @row-dblclicked="showEditModal"
      @sort-changed="fetchTable"
      class="my-2 data-table"
      :busy="isBusy"
      empty-text="Записей не найдено"
      empty-filtered-text="Записей не найдено"
    >
      <template v-slot:cell(actions)="row">
        <b-button size="sm" variant="link" @click="row.toggleDetails">{{!row.item._showDetails ? 'Подробнее...' : 'Скрыть'}}</b-button>
      </template>

      <template v-slot:cell(password)="row">
        <b-button size="sm" variant="link" @click="togglePassword(row.item)">{{row.item.password}}</b-button>
      </template>

      <template v-slot:row-details="row">
        <b-card>
          <ul>
            <li
              v-for="(value, key) in getItemFormValue(row.item)"
              :key="key"
              style="list-style-type: none;">{{ getName(key) }}: {{ value }}</li>
          </ul>
        </b-card>
      </template>

      <template v-slot:table-busy>
        <div class="text-center text-secondary my-2">
          <b-spinner small class="align-middle"></b-spinner>
          <strong>Загрузка...</strong>
        </div>
      </template>
    </b-table>

    <ModelModal :baseUrl="baseUrl" :itemForm="itemForm" ref="modelModal" modalId="modalModel" @formSaved="fetchTable" />
  </div>
</template>

<script>
import ModelModal from "../components/ModelModal";
export default {
  components: {
    ModelModal
  },
  props: [
    "baseUrl", 
    "fields", 
    "itemForm", 
    "filterPlaceHolder", 
    "hideSearch", 
    "additionalButtons", 
    "passwordShowButton", 
    "creationErrorMessage",
    "hasCustomFields"
  ],
  data() {
    return {
      items: [],
      importedFile: [], 
      currentPage: 1,
      perPage: 10,
      total: 0,
      pageOptions: [10, 50, 100, 200, 500],
      sortBy: "",
      sortDesc: false,
      selectAll: false,
      filter: null,
      isBusy: true,
      selected: []
    };
  },
  mounted() {
    this.fetchTable();
  },
  methods: {
    async fetchTable() {
      if (this.hasCustomFields) await this.updateCustomFields();
      this.selectAll = false;
      this.isBusy = true;
      const result = await this.$getAsync(this.baseUrl + "/list", {
        sort: this.sortBy
          ? `${this.sortBy} ${this.sortDesc ? "DESC" : "ASC"}`
          : null,
        page: this.currentPage,
        perPage: this.perPage,
        search: this.filter
      });
      this.items = result.data;
      this.currentPage = result.page;
      this.total = result.total;
      this.isBusy = false;
    },
    async updateCustomFields() {
      const customFields = await this.$getAsync(`${this.baseUrl}/fields`);
      for (let index = this.itemForm.length - 1; index >= 0; index--) {
        if (this.itemForm[index].isCustom) this.itemForm.splice(index, 1); 
      }
      customFields.forEach(field => {
        this.itemForm.push({
          label: field.label,
          property: field.name,
          type: "string",
          isCustom: true
        })
      });
    },
    async togglePassword(item) {
      if ( item.isPasswordShowed ) {
        item.isPasswordShowed = false;
        item.password = '***';
      } else {
        item.isPasswordShowed = true;
        item.password = await this.passwordShowButton.getPassword(item.id);
      }
    },
    getItemFormValue(item){
      const allowed = this.itemForm.filter(f => !f.hidden && f.type != "content").map(f => f.property);
      let result = Object.keys(item)
        .filter(key => allowed.includes(key))
        .reduce((obj, key) => {
          let value = item[key];
          const field = this.itemForm.find(f => f.property == key);
          if (field.type == "date"){
            value = value ? this.$moment(value).format("DD.MM.YYYY") : null;
          }
          if (field.type == "checkbox"){
            value = value ? "есть" : "нет";
          }
          if (field.type == "model"){
            value = value ? (value.name || value.id) : "";
          }
          if (field.type == "enum"){
            value = value ? (field.options.find(o => o.value == value).text) : "";
          }
          if (field.type == "schedule"){
            value = this.$getScheduleView(value);
          }
          obj[key] = value;
          return obj;
        }, {});
        return result;
    },
    async importFile(event){
      if (!event.target.files.length) return;
      const files = event.target.files;
      const data = new FormData();
      data.append('file', files[0]);
      this.importedFile = [];
      await this.$postAsync(`${this.baseUrl}/import`, data, null, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      await this.fetchTable();
    },
    async showEditModal(item, index, button) {
      if (this.hasCustomFields) await this.updateCustomFields();
      this.$refs.modelModal.showEdit(item, index, button);
    },
    async showAddModal() {
      if (this.creationErrorMessage){
        this.$error(this.creationErrorMessage); 
      } else {
        if (this.hasCustomFields) await this.updateCustomFields();
        this.$refs.modelModal.showAdd();
      }
    },
    async showDeleteConfirm() {
      const confirm = await this.$bvModal.msgBoxConfirm(
        `Вы уверены, что хотите удалить ${this.selected.length} записей?`,
        {
          cancelTitle: "Отмена",
          cancelVariant: "outline-secondary",
          okTitle: "Удалить",
          okVariant: "danger"
        }
      );
      if (!confirm) return;
      await this.$postAsync(this.baseUrl + "/delete", {
        id: this.selected.map(s => s.id)
      });
      
      await this.fetchTable();
    },
    getName(property) {
      const item = this.itemForm.find(f => f.property == property);
      if (item) {
        return item.label;
      }
      return property;
    },
    onRowSelected(items) {
      this.selected = items;
    },
    selectAllRows() {
      this.$refs.selectableTable.selectAllRows();
    },
    clearSelected() {
      this.$refs.selectableTable.clearSelected();
    }
  },
  watch: {
    selectAll: function(val) {
      return val ? this.selectAllRows() : this.clearSelected();
    }
  }
};
</script>

<style scoped>
.data-table {
  font-size: small !important;
}

.select-all-checkbox{
  min-height: 0;
}
</style>