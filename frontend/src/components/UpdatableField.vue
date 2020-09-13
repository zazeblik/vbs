<template>
  <validation-provider
    :name="label"
    :rules="validations"
    v-slot="validationContext"
  >
    <b-form-group label-cols-sm="3" label-size="sm" :label="label" class="mb-1">
      <b-form-input
        size="sm"
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
    return {
      model: this.fieldValue
    }
  },
  methods: {
    async save(validationState) {
      const state = this.getValidationState(validationState);
      if (state) {
        let changes = {};
        changes[this.field] = this.model;
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
  }
}
</script>