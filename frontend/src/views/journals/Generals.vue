<template>
  <div class="py-2">
    <b-breadcrumb class="mt-1">
      <b-breadcrumb-item active>Общие группы</b-breadcrumb-item>
    </b-breadcrumb>
    <b-input-group size="sm">
      <b-input-group-prepend is-text>
        <b-icon icon="search"></b-icon>
      </b-input-group-prepend>
      <b-form-input v-model="nameFilter" type="text" placeholder="Введите название" @change="nameFilterChanged" />
      <b-input-group-append>
        <b-button variant="outline-success" @click="showAddModal">
          <b-icon icon="plus-circle-fill"></b-icon>&nbsp;<span class="d-none d-md-inline-block">Добавить</span>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-overlay :show="showOverlay" rounded="sm">
      <b-row class="mt-3 scrollable">
        <b-col 
          v-for="group in shownGroups" 
          :key="group.id"
          lg="3"
          md="4"
          sm="6" >
          <b-card header-tag="header" header-class="pl-3 pr-1" body-class="p-0" class="mb-3">
            <template v-slot:header>
              <b-dropdown size="sm" dropleft class="dropdown-actions" variant="link" toggle-class="text-decoration-none" no-caret>
                <template v-slot:button-content>
                  <b-icon icon="three-dots-vertical"/><span class="sr-only">Actions</span>
                </template>
                <b-dropdown-item @click="showEditModal(group)">Редактировать</b-dropdown-item>
                <b-dropdown-item @click="showDeleteConfirm(group)">Удалить</b-dropdown-item>
              </b-dropdown>
              <h6 class="mb-0 pointed" @click="goToDetailPage(group)">{{group.name}}</h6>
            </template>
            <b-card-text class="px-3 pt-2 pb-1 pointed" @click="goToDetailPage(group)">
              <p>Стоимость: {{group.cost}}</p>
              <p>Участников: {{group.members.length}}</p>
              <p>{{$getScheduleView(group.schedule)}}</p>
            </b-card-text>
          </b-card>
        </b-col>
      </b-row>
    </b-overlay>
    <ModelModal modalId="modalModel" :baseUrl="baseUrl" :itemForm="itemForm" ref="modelModal" @formSaved="fetchData" />
  </div>
</template>

<script>
const GroupType = require("../../../../enums").GroupType;
import ModelModal from "../../components/ModelModal";
import { GroupForm } from "../../shared/forms";
export default {
  components: {
    ModelModal
  },
  data() {
    return {
      baseUrl: "/groups",
      showOverlay: false,
      selectedInstructor: null,
      nameFilter: null,
      groups: [],
      shownGroups: [],
      instructors: [],
      persons: [],
      itemForm: Object.assign([], GroupForm)
    };
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async fetchData() {
      await this.fetchSettings();
      await this.fetchGroups();
    },
    async fetchSettings() {
      this.showOverlay = true;
      const general = await this.$getAsync(`${this.baseUrl}/general`);
      this.instructors = general.instructors;
      this.persons = general.persons;
      this.itemForm.find(f => f.property == "defaultInstructor").models = this.instructors;
      this.itemForm.find(f => f.property == "hidden").hidden = true;
      this.itemForm.find(f => f.property == "type").hidden = true;
      this.selectedInstructor = this.$user.instructor;
      this.showOverlay = false;
    },
    async fetchGroups() {
      this.showOverlay = true;
      this.groups = await this.$getAsync(`${this.baseUrl}/journal-groups`, {
        type: GroupType.General
      });
      this.shownGroups = this.groups;
      this.nameFilter = null;
      this.showOverlay = false;
    },
    showAddModal() {
      this.itemForm.find(f => f.property == "defaultInstructor").value = this.selectedInstructor;
      this.itemForm.find(f => f.property == "type").value = GroupType.General;
      this.$refs.modelModal.showAdd();
    },
    showEditModal(group) {
      this.$refs.modelModal.showEdit(group);
    },
    goToDetailPage(group) {
      this.$router.push({ 
        path: `/cp/group-detail/${group.id}`
      });
    },
    nameFilterChanged(val) {
      if (val) {
        this.shownGroups = this.groups.filter(x => x.name.includes(val));
      } else {
        this.shownGroups = this.groups;
      }
    },
    async showDeleteConfirm(group) {
      try {
        const confirm = await this.$bvModal.msgBoxConfirm(
          `Вы уверены, что хотите удалить ${group.name}?`,
          {
            cancelTitle: "Отмена",
            cancelVariant: "outline-secondary",
            okTitle: "Удалить",
            okVariant: "danger"
          }
        );
        if (!confirm) return;
        await this.$postAsync(`${this.baseUrl}/delete/${group.id}`);
        await this.fetchData()
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    }
  }
};
</script>

<style scoped>
.card-text {
  min-height: 60px;
}
.scrollable {
  overflow-y: auto;
  height: calc(100vh - 190px);
}
</style>
