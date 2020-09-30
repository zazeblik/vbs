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
        </b-button-group>
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
  props: ["baseUrl", "fields", "itemForm", "filterPlaceHolder", "hideSearch"],
  data() {
    return {
      items: [],
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
    getItemFormValue(item){
      const allowed = this.itemForm.filter(f => !f.hidden && f.type != "content").map(f => f.property);
      return Object.keys(item)
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
    },
    showEditModal(item, index, button) {
      this.$refs.modelModal.showEdit(item, index, button);
    },
    showAddModal() {
      this.$refs.modelModal.showAdd();
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
      return item ? item.label : property;
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