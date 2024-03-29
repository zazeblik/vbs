<template>
  <validation-provider :name="label" :rules="validations" v-slot="validationContext">
    <b-overlay :show="showSpinner" rounded="sm">
      <b-form-group label-cols-sm="2" label-size="sm" :label="label" class="mb-1">
        <b-form-datepicker
          v-if="type == 'date'"
          size="sm"
          placeholder="Выберите дату"
          show-decade-nav
          :date-format-options="{ day: '2-digit', month: '2-digit', year: 'numeric'  }"
          value-as-date
          :start-weekday="1"
          v-model="model"
          @hidden="save(validationContext, settingsField)"
          :state="getValidationState(validationContext)"
        />
        <b-form-checkbox
          size="lg"
          v-else-if="type == 'checkbox'"
          v-model="model"
          @input="save({dirty: true, valid: true}, settingsField)"
          :state="getValidationState({dirty: true, valid: true})"
        />
        <b-form-textarea
          v-else-if="type == 'textarea'"
          size="sm"
          rows="3"
          max-rows="6"
          v-model="model"
          :placeholder="placeholder"
          @change="save(validationContext, settingsField)"
          :state="getValidationState(validationContext)"
        />
        <b-form-select
          v-else-if="type == 'select'"
          size="sm"
          v-model="model"
          :options="options"
          @change="save(validationContext, settingsField)"
          :state="getValidationState(validationContext)"
        />
        <b-form-input
          v-else
          :type="type"
          size="sm"
          v-model="model"
          :placeholder="placeholder"
          @change="save(validationContext, settingsField)"
          :state="getValidationState(validationContext)"
        />
        <b-form-invalid-feedback :id="'feedback_'+field">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
      </b-form-group>
    </b-overlay>
  </validation-provider>
</template>

<script>
export default {
  props: [
    "label",
    "validations",
    "fieldValue",
    "field",
    "updateUrl",
    "type",
    "placeholder",
    "options",
    "settingsField"
  ],
  data() {
    const updatableField = this.initComponent();
    return {
      showSpinner: false,
      updatableField: updatableField,
      model: updatableField.initModel(),
    };
  },
  methods: {
    async save(validationState, settingsField) {
      const state = this.getValidationState(validationState);
      if (state) {
        let changes = {};
        changes[this.field] = this.updatableField.convertModel(this.model);
        const result = await this.$postAsync(this.updateUrl, changes, true);
        if (settingsField) this.$settings[this.field] = this.model;
        this.$bvToast.toast("Статус запроса: " + result, {
          title: `Значение ${this.label} ${
            result == "OK" ? "успешно" : "не"
          } сохранено`,
          variant: result == "OK" ? "success" : "danger",
          autoHideDelay: 3000,
          solid: true,
        });
      }
      return state;
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    convertModel(model) {
      if (this.type == "date") {
        return model.getTime();
      }
      return model;
    },

    initComponent() {
      if (this.type == "date") {
        return new dateUpdatableField(this.fieldValue);
      } else {
        return new defaultUpdatableField(this.fieldValue);
      }
    },
  },
};

class dateUpdatableField {
  constructor(fieldValue) {
    this.fieldValue = fieldValue;
  }

  convertModel(model) {
    return model.getTime();
  }

  initModel() {
    return this.fieldValue ? new Date(this.fieldValue) : new Date();
  }
}

class defaultUpdatableField {
  constructor(fieldValue) {
    this.fieldValue = fieldValue;
  }

  convertModel(model) {
    return model;
  }
  initModel() {
    return this.fieldValue;
  }
}
</script>