<template>
  <div class="py-2">
    <b-breadcrumb class="mt-1 with-btn">
      <b-breadcrumb-item active>Индивидуальные группы</b-breadcrumb-item>
      <b-button size="sm" variant="outline-dark" @click="autoDebit">
        <b-icon icon="lightning-fill"></b-icon>&nbsp;Оплатить занятия
      </b-button>
    </b-breadcrumb>
    <b-input-group prepend="Тренер" size="sm">
      <model-select v-model="selectedInstructor" :options="$modelsToOptions(instructors)" @input="selectedInstructorChanged" />
      <b-input-group-append>
        <b-button variant="outline-success" @click="showAddModal">
          <b-icon icon="plus-circle-fill"></b-icon>&nbsp;Добавить
        </b-button>
        <b-button variant="outline-primary" @click="goToTrenerPersonals">
          Расписание тренера&nbsp;<b-icon icon="arrow-right"></b-icon>
        </b-button>
      </b-input-group-append>
    </b-input-group>
    <b-row class="mt-3 scrollable">
      <b-col 
        v-for="group in groups" 
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
          <b-card-text class="px-3 pt-2 pb-1">
            {{$getScheduleView(group.schedule)}}
            <GroupPersonsManager 
              :groupId="group.id" 
              :members="group.members" 
              :persons="persons"
              :defaultInstructor="group.defaultInstructor.id"
              @changed="fetchGroups" />
          </b-card-text>
        </b-card>
      </b-col>
    </b-row>
    <ModelModal modalId="modalModel" :baseUrl="baseUrl" :itemForm="itemForm" ref="modelModal" @formSaved="fetchData" />
  </div>
</template>

<script>
const GroupType = require("../../../../enums").GroupType;
import ModelModal from "../../components/ModelModal";
import GroupPersonsManager from "../../components/GroupPersonsManager";
import { ModelSelect } from "vue-search-select";
import { GroupForm } from "../../shared/forms";
export default {
  components: {
    ModelModal,
    ModelSelect,
    GroupPersonsManager
  },
  data() {
    return {
      baseUrl: "/groups",
      selectedInstructor: null,
      groups: [],
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
      if (!this.selectedInstructor) return;
      await this.fetchGroups();
    },
    async fetchSettings() {
      const personal = await this.$getAsync(`${this.baseUrl}/personal`);
      this.instructors = personal.instructors;
      this.persons = personal.persons;
      this.itemForm.find(f => f.property == "defaultInstructor").models = this.instructors;
      this.itemForm.find(f => f.property == "hidden").hidden = true;
      this.itemForm.find(f => f.property == "type").hidden = true;
      if (this.selectedInstructor)
        return;

      this.selectedInstructor = this.$route.query.instructor
        ? Number(this.$route.query.instructor)
        : this.instructors[0] 
          ? this.instructors[0].id 
          : null;
    },
    async fetchGroups() {
      this.groups = await this.$getAsync(`${this.baseUrl}/instructor-groups/${this.selectedInstructor}`, {
        type: GroupType.Personal
      });
    },
    async selectedInstructorChanged(){
      this.itemForm.find(f => f.property == "defaultInstructor").value = this.selectedInstructor;
      this.$router.replace({ name: "personals", query: {instructor: this.selectedInstructor} }).catch(err => {});
      await this.fetchData();
    },
    showAddModal() {
      this.itemForm.find(f => f.property == "defaultInstructor").value = this.selectedInstructor;
      this.itemForm.find(f => f.property == "type").value = GroupType.Personal;
      this.$refs.modelModal.showAdd();
    },
    async autoDebit() {
      try {
        const confirm = await this.$bvModal.msgBoxConfirm(
          `При наличии необходимой суммы на балансе участника автоматичекси оплатятся посещённые, но не оплаченные индивидуальные занятия. 
          Вы уверены, что хотите это сделать?`,
          {
            cancelTitle: "Отмена",
            cancelVariant: "outline-secondary",
            okTitle: "Списать",
            okVariant: "success"
          }
        );
        if (!confirm) return;
        await this.$postAsync(this.baseUrl + "/auto-debit");
        this.$bvToast.toast("Занятия успешно оплачены", {
          title: "Автоматическая оплата занятий",
          variant: "success",
          autoHideDelay: 3000,
          solid: true,
        });
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    },
    showEditModal(group) {
      this.$refs.modelModal.showEdit(group);
    },
    goToTrenerPersonals() {
      this.$router.push({ 
        path: `/cp/instructor-schedule/${this.selectedInstructor}`
      });
    },
    goToDetailPage(group) {
      this.$router.push({ 
        path: `/cp/group-detail/${group.id}`
      });
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
.with-btn {
  justify-content: space-between;
}
.scrollable {
  overflow-y: auto;
  height: calc(100vh - 190px);
}
</style>
