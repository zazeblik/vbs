<template>
  <validation-provider
    :name="label"
    :rules="validations"
    v-slot="validationContext"
  >
    <b-form-group label-cols-sm="3" label-size="sm" :label="label" class="mb-1">
      <b-form-datepicker
        v-if="type == 'date'"
        size="sm"
        placeholder="Выберите дату"
        show-decade-nav
        :date-format-options="{ day: '2-digit', month: '2-digit', year: 'numeric'  }"
        value-as-date
        :start-weekday="1"
        v-model="model"
        @hidden="save(validationContext)"
        :state="getValidationState(validationContext)"
      />
      <b-form-checkbox
        size="lg"
        v-else-if="type == 'checkbox'"
        v-model="model"
        @input="save({dirty: true, valid: true})"
        :state="getValidationState({dirty: true, valid: true})"
      />
      <b-form-input
        v-else
        :type="type"
        v-model="model"
        :placeholder="placeholder"
        @change="save(validationContext)"
        :state="getValidationState(validationContext)"
      />

      <b-form-invalid-feedback :id="'feedback_'+field">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
    </b-form-group>
  </validation-provider>
</template>

<script>
export default {
  props: [ "label", "validations", "fieldValue", "field", "updateUrl", "type", "placeholder" ],
  data() {
    const updatableField = this.initComponent();
    return {
      updatableField: updatableField,
      model: updatableField.initModel()
    }
  },
  methods: {
    async save(validationState) {
      const state = this.getValidationState(validationState);
      if (state) {
        let changes = {};
        changes[this.field] = this.updatableField.convertModel(this.model);
        const result = await this.$postAsync(this.updateUrl, changes, true);
        this.$bvToast.toast('Статус запроса: ' + result, {
          title: `Значение ${this.label} ${result == 'OK' ? 'успешно' : 'не'} сохранено`,
          variant: result == 'OK' ? 'success' : 'danger',
          autoHideDelay: 3000,
          solid: true
        });
      }
      return state;
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },

    convertModel(model) {
      if ( this.type == 'date' ) { 
        return model.getTime();
      }
      return model;
    },

    initComponent() {
      if ( this.type == 'date' ) {
        return new dateUpdatableField(this.fieldValue);
      } else {
        return new defaultUpdatableField(this.fieldValue);
      }
    }
  }
}

class dateUpdatableField {
  constructor(fieldValue) {
    this.fieldValue = fieldValue;
  }

  convertModel(model) {
    return model.getTime();
  }
  
  initModel() {
    return this.fieldValue
      ? new Date(this.fieldValue)
      : new Date();
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