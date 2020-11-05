<template>
  <b-container class="py-2">
    <b-tabs fill small lazy>
      <b-tab class="pt-2" title="Оплата" v-if="$user.person">
        <PaymentsBlock :isControlPanelShown="false" />
      </b-tab>
      <b-tab class="pt-2" title="Профиль">
        <validation-observer ref="observer">
          <b-form>
            <div v-if="$user.person && isLoaded">
              <UpdatableField
                label="Фамилия Имя"
                :validations="{ required: true, min: 2 }"
                :fieldValue="person.name"
                field="name"
                updateUrl="/site/profile-person" />
              <UpdatableField
                type="date"
                label="Дата рождения"
                :fieldValue="person.birthday"
                field="birthday"
                updateUrl="/site/profile-person" />
              <UpdatableField
                v-for="(field, index) in customFields"
                :key="index"
                :label="field.label"
                :fieldValue="person[field.name]"
                :field="field.name"
                updateUrl="/site/profile-person" />
            </div>
            <hr />
            <UpdatableField 
              label="Логин"
              :validations="{ required: true, min: 2 }"
              :fieldValue="$user.login"
              field="login"
              updateUrl="/site/profile" />
            <UpdatableField 
              label="Пароль"
              :validations="{ min: 8, regex: /^([A-Za-z0-9]+)$/ }"
              :fieldValue="password"
              field="password"
              updateUrl="/site/profile"
              type="password"
              placeholder="Введите новый пароль..." />
          </b-form>
        </validation-observer>
      </b-tab>
    </b-tabs> 
  </b-container>
</template>

<script>
import PaymentsBlock from "../../components/PaymentsBlock";
import UpdatableField from "../../components/UpdatableField";
export default {
  components: {
    PaymentsBlock,
    UpdatableField
  },
  async mounted(){
    if (this.$user.person){
      this.person = await this.$getAsync('/site/person');
      this.isLoaded = true;
      this.customFields = await this.$getAsync('/persons/fields');
    }
  },
  data() {
    return {
      password: null,
      person: null,
      customFields: [],
      isLoaded: false
    };
  }
};
</script>