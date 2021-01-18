<template>
<div class="py-2">
  Участники:
  <b-list-group>
    <b-list-group-item 
      class="p-1"
      v-for="member in members" 
      :key="member.id">
      {{member.name}}
      <b-dropdown size="sm" dropleft class="dropdown-actions" variant="link" toggle-class="text-decoration-none" no-caret>
          <template v-slot:button-content>
            <b-icon icon="three-dots-vertical"/><span class="sr-only">Actions</span>
          </template>
          <b-dropdown-item @click="showRemovePersonConfirm(member)">Удалить из группы</b-dropdown-item>
        </b-dropdown>
    </b-list-group-item>
  </b-list-group>
  <b-button class="w-100" variant="outline-success" size="sm" :hidden="addPersonShown"  @click="addPersonShown = true">
    <b-icon icon="plus-circle-fill"></b-icon>&nbsp;Добавить
  </b-button>
  <b-input-group size="sm" :hidden="!addPersonShown">
    <model-select v-model="selectedPerson" :options="$modelsToOptions(availablePersons)" />
    <b-input-group-append>
      <b-button variant="outline-success" @click="addPerson()">
        <b-icon icon="check"></b-icon>
      </b-button>
      <b-button variant="outline-danger" @click="addPersonShown = false">
        <b-icon icon="x"></b-icon>
      </b-button>
    </b-input-group-append>
  </b-input-group>
</div>
</template>

<script>
import { ModelSelect } from 'vue-search-select'
export default {
  components: {
    ModelSelect
  },
  props: ["members", "groupId", "persons", "defaultInstructor"],
  data(){
    return {
      addPersonShown: false,
      selectedPerson: null
    }
  },
  computed: {
    availablePersons() {
      return this.persons
        .filter(p => p.id != this.defaultInstructor && !this.members.map(m => m.id).includes(p.id))
    }
  },
  methods: {
    async showRemovePersonConfirm(person) {
      try {
        const confirm = await this.$bvModal.msgBoxConfirm(
          `Вы уверены, что хотите удалить ${person.name} из группы?`,
          {
            cancelTitle: "Отмена",
            cancelVariant: "outline-secondary",
            okTitle: "Удалить",
            okVariant: "danger"
          }
        );
        if (!confirm) return;
        await this.removePerson(person.id);
      } catch (error) {
        if (error.response) {
          this.$error(error.response.data.message || error.response.data);
        }
      }
    },
    async removePerson(person) {
      await this.$postAsync(`/groups/remove-person/${this.groupId}`, { person });
      this.$emit("changed");
    },
    async addPerson() {
      await this.$postAsync(`/groups/add-person/${this.groupId}`, { person: this.selectedPerson });
      this.addPersonShown = false;
      this.$emit("changed");
    },
  }
}
</script>