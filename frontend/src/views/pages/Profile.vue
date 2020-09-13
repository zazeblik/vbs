<template>
  <b-container class="py-2">
    <b-tabs fill small lazy>
      <b-tab class="pt-2" title="Оплата" v-if="$user.person">
        <PaymentsBlock :isControlPanelShown="false" />
      </b-tab>
      <b-tab class="pt-2" title="Профиль">
        <validation-observer ref="observer">
          <b-form>
            <UpdatableField
              v-if="$user.person"
              label="Фамилия Имя"
              :validations="{ required: true, min: 2 }"
              :fieldValue="person.name"
              field="name"
              updateUrl="/site/profile-person" />
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
      this.person = await this.$getAsync('/persons/'+this.$user.person);
    }
  },
  data() {
    return {
      password: null,
      person: null
    };
  }
};
</script>