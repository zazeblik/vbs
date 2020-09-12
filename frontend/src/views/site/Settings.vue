<template>
  <b-container class="py-2">
    <h5>Настройки сайта</h5>
    <validation-observer ref="observer">
      <b-form>
        <validation-provider
          :name="nameLabel"
          :rules="{ required: true, min: 2 }"
          v-slot="validationContext"
        >
          <b-form-group label-cols-sm="3" label-size="sm" :label="nameLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.name"
              @change="save(validationContext, { name: $settings.name })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_name">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider :name="subtitleLabel" :rules="{ min: 3 }" v-slot="validationContext">
          <b-form-group label-cols-sm="3" label-size="sm" :label="subtitleLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.subtitle"
              @change="save(validationContext, { subtitle: $settings.subtitle })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_subtitle">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider :name="phoneLabel" :rules="{ min: 3 }" v-slot="validationContext">
          <b-form-group label-cols-sm="3" label-size="sm" :label="phoneLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.phone"
              @change="save(validationContext, { phone: $settings.phone })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_phone">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider
          :name="emailLabel"
          :rules="{ min: 3, email: true }"
          v-slot="validationContext"
        >
          <b-form-group label-cols-sm="3" label-size="sm" :label="emailLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.email"
              @change="save(validationContext, { email: $settings.email })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_email">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider :name="fullNameLabel" :rules="{ min: 3 }" v-slot="validationContext">
          <b-form-group label-cols-sm="3" label-size="sm" :label="fullNameLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.fullName"
              @change="save(validationContext, { fullName: $settings.fullName })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_fullName">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider :name="vkLabel" :rules="{ min: 3 }" v-slot="validationContext">
          <b-form-group label-cols-sm="3" label-size="sm" :label="vkLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.vk"
              @change="save(validationContext, { vk: $settings.vk })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_vk">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider :name="vkGroupIdLabel" :rules="{ min: 3 }" v-slot="validationContext">
          <b-form-group label-cols-sm="3" label-size="sm" :label="vkGroupIdLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.vkGroupId"
              @change="save(validationContext, { vkGroupId: $settings.vkGroupId })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_group_id_vk">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider :name="fbLabel" :rules="{ min: 3 }" v-slot="validationContext">
          <b-form-group label-cols-sm="3" label-size="sm" :label="fbLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.fb"
              @change="save(validationContext, { fb: $settings.fb })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_fb">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider :name="instagramLabel" :rules="{ min: 3 }" v-slot="validationContext">
          <b-form-group label-cols-sm="3" label-size="sm" :label="instagramLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.instagram"
              @change="save(validationContext, { instagram: $settings.instagram })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_instagram">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider :name="marimediaLabel" :rules="{ min: 3 }" v-slot="validationContext">
          <b-form-group label-cols-sm="3" label-size="sm" :label="marimediaLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.marimedia"
              @change="save(validationContext, { marimedia: $settings.marimedia })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_marimedia">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider :name="sberUsernameLabel" :rules="{ min: 3 }" v-slot="validationContext">
          <b-form-group label-cols-sm="3" label-size="sm" :label="sberUsernameLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.sberUsername"
              @change="save(validationContext, { sberUsername: $settings.sberUsername })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_sberUsername">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
          </b-form-group>
        </validation-provider>
        <validation-provider :name="sberPasswordLabel" :rules="{ min: 3 }" v-slot="validationContext">
          <b-form-group label-cols-sm="3" label-size="sm" :label="sberPasswordLabel" class="mb-1">
            <b-form-input
              size="sm"
              v-model="$settings.sberPassword"
              @change="save(validationContext, { sberPassword: $settings.sberPassword })"
              :state="getValidationState(validationContext)"
            />
            <b-form-invalid-feedback id="feedback_sberPassword">{{ validationContext.errors[0] }}</b-form-invalid-feedback>
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
      phoneLabel: "Телефон",
      emailLabel: "Email",
      fullNameLabel: "Полное имя",
      vkLabel: "VK",
      vkGroupIdLabel: "ID группы VK",
      fbLabel: "Facebook",
      instagramLabel: "Instagram",
      marimediaLabel: "Маримедиа",
      sberUsernameLabel: "Логин Cбербанк",
      sberPasswordLabel: "Пароль Cбербанк"
    };
  },
  methods: {
    save(validationState, changes) {
      const state = this.getValidationState(validationState);
      if (state) {
        this.$postAsync(`${this.baseUrl}/update`, changes);
      }
      return state;
    },
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
  },
};
</script>