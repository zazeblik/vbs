<template>
  <div class="py-2">
    <h5>Настройки сайта</h5>
    <validation-observer ref="observer">
    <b-tabs fill small class="pt-2">
      <b-tab title="Общие">
        <b-form class="pt-2">
          <UpdatableField 
            label="Название сайта"
            :validations="{ required: true, min: 2 }"
            :fieldValue="$settings.name"
            field="name"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Подзаголовок"
            :validations="{ min: 3 }"
            :fieldValue="$settings.subtitle"
            field="subtitle"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Иконка сайта"
            type="icon"
            :fieldValue="$settings.icon"
            field="icon"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Описание"
            :validations="{ min: 3 }"
            :fieldValue="$settings.description"
            field="description"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Ключевые слова (через запятую)"
            :validations="{ min: 3 }"
            :fieldValue="$settings.keywords"
            field="keywords"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Логотип сайта"
            type="image"
            :fieldValue="$settings.logo"
            field="logo"
            updateUrl="/site/update" />
          <UpdatableField
            label="Логотип вместо названия"
            type="checkbox"
            :fieldValue="$settings.replaceName"
            field="replaceName"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Телефон"
            :validations="{ min: 3 }"
            :fieldValue="$settings.phone"
            field="phone"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Email"
            :validations="{ min: 3, email: true }"
            :fieldValue="$settings.email"
            field="email"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Полное имя"
            :validations="{ min: 3 }"
            :fieldValue="$settings.fullName"
            field="fullName"
            updateUrl="/site/update" />
        </b-form> 
      </b-tab>
      <b-tab title="Интеграции">
        <b-form class="pt-2">
          <UpdatableField 
            label="VK"
            :validations="{ min: 3 }"
            :fieldValue="$settings.vk"
            field="vk"
            updateUrl="/site/update" />
          <UpdatableField 
            label="ID группы VK"
            :validations="{ min: 3 }"
            :fieldValue="$settings.vkGroupId"
            field="vkGroupId"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Facebook"
            :validations="{ min: 3 }"
            :fieldValue="$settings.fb"
            field="fb"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Instagram"
            :validations="{ min: 3 }"
            :fieldValue="$settings.instagram"
            field="instagram"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Marimedia"
            :validations="{ min: 3 }"
            :fieldValue="$settings.marimedia"
            field="marimedia"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Логин Cбербанк"
            :validations="{ min: 3 }"
            :fieldValue="$settings.sberUsername"
            field="sberUsername"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Пароль Cбербанк"
            :validations="{ min: 3 }"
            :fieldValue="$settings.sberPassword"
            field="sberPassword"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Произвольный HTML (в теге head)"
            type="textarea"
            :validations="{ min: 3 }"
            :fieldValue="$settings.headHtml"
            field="headHtml"
            updateUrl="/site/update" />
          <UpdatableField 
            label="Произвольный HTML (в конце body)"
            type="textarea"
            :validations="{ min: 3 }"
            :fieldValue="$settings.bottomHtml"
            field="bottomHtml"
            updateUrl="/site/update" />
        </b-form>
      </b-tab>
    </b-tabs>
    </validation-observer>
  </div>
</template>

<script>
import UpdatableField from "../../components/UpdatableField";
export default {
  components: {
    UpdatableField
  }
};
</script>