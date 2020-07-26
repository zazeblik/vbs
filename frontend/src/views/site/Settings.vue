<template>
  <b-container class="py-2">
    <h5>Настройки сайта</h5>
    <validation-observer ref="observer">
    <b-form>
      <validation-provider :name="nameLabel" :rules="{ required: true, min: 2 }" v-slot="validationContext">
        <b-form-group label-cols-sm="3" label-size="sm" :label="nameLabel" class="mb-1" >
          <b-form-input size="sm" v-model="name" @change="save(validationContext, { name })" :state="getValidationState(validationContext)" />
          <b-form-invalid-feedback id="feedback_name">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
        </b-form-group>
      </validation-provider>
      <validation-provider :name="subtitleLabel" :rules="{ min: 3 }" v-slot="validationContext">
        <b-form-group label-cols-sm="3" label-size="sm" :label="subtitleLabel" class="mb-1" >
          <b-form-input size="sm" v-model="subtitle" 
            @change="save(validationContext, { subtitle })" :state="getValidationState(validationContext)" />
          <b-form-invalid-feedback id="feedback_subtitle">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
        </b-form-group>
      </validation-provider>
    </b-form>
    </validation-observer>
  </b-container>
</template>

<script>
export default {
  data() {
    return {
      baseUrl: "/site",
      nameLabel: "Название сайта",
      subtitleLabel: "Подзаголовок",
      subtitle: null,
      name: null
    }
  },
  async mounted(){
    const settings = await this.$getAsync(`${this.baseUrl}/settings`);
    this.name = settings.name;
    this.subtitle = settings.subtitle;
  },
  methods: {
    save(validationState, changes){
      const state = this.getValidationState(validationState);
      if (state){
        this.$postAsync(`${this.baseUrl}/update`, changes);
      }
      return state;
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    }
  }
}
</script>