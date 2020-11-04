<template>
  <div>
    <validation-observer ref="observer" v-slot="{ invalid }">
      <b-modal
        :id="modalId"
        title="Добавочные поля"
        @close="resetForm"
        @cancel="resetForm"
        size="sm"
        no-stacking
        hide-footer
      >
        <b-overlay :show="showSpinner" rounded="sm">
          <b-form>
            <validation-provider
              v-for="(control, index) in fields"
              :key="index"
              :rules="{ required: true }"
              v-slot="validationContext"
            >
              <b-form-group>
                <b-input-group size="sm">
                  <b-form-input
                    type="text"
                    placeholder="Введите название"
                    v-model="control.label"
                    :state="getValidationState(validationContext)"
                  />
                  <b-input-group-append>
                    <b-button
                      variant="outline-danger"
                      @click="fields.splice(index, 1)"
                    >
                      <b-icon icon="slash-circle-fill" rotate="45" />
                    </b-button>
                  </b-input-group-append>
                </b-input-group>
              </b-form-group>
            </validation-provider>
            <b-input-group class="d-flex pt-3 justify-content-between">
              <b-button variant="outline-success" size="sm" @click="addField">
                <b-icon icon="plus-circle-fill"></b-icon>&nbsp;Добавить
              </b-button>
              <b-button
                variant="success"
                size="sm"
                :disabled="invalid || !fields.length"
                @click="sendForm"
              >
                <span>Сохранить</span>
              </b-button>
            </b-input-group>
          </b-form>
        </b-overlay>
      </b-modal>
    </validation-observer>
  </div>
</template>

<script>
export default {
  props: ["modalId"],
  data() {
    return {
      id: null,
      fields: [],
      showSpinner: false,
      baseUrl: "/persons",
    };
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    resetForm() {
      this.$nextTick(() => {
        this.$refs.observer.reset();
      });
    },
    async show() {
      this.fields = await this.$getAsync(`${this.baseUrl}/fields`);
      this.$root.$emit("bv::show::modal", this.modalId);
    },
    getPreparedFields() {
      return this.fields.map((x) => {
        return {
          id: x.id,
          name: x.name,
          label: x.label,
        };
      });
    },
    async sendForm() {
      const result = await this.$postAsync(
        `${this.baseUrl}/set-fields`,
        this.getPreparedFields(),
        true
      );
      if (result != "OK") {
        return;
      }
      this.$root.$emit("bv::hide::modal", this.modalId);
      this.$bvToast.toast("Статус запроса: " + result, {
        title: "Поля успешно сохранены",
        variant: "success",
        autoHideDelay: 3000,
        solid: true,
      });
      this.resetForm();
      this.$emit("formSaved");
    },
    addField() {
      this.fields.push({
        label: "",
      });
    },
  },
};
</script>