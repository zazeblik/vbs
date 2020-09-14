<template>
  <b-container class="py-2">
    <b-tabs fill small lazy>
      <b-tab class="pt-2" title="Оплата" v-if="$user.person">
        <PaymentsBlock :isControlPanelShown="false" />
      </b-tab>
      <b-tab class="pt-2" title="Профиль">
        <validation-observer ref="observer">
          <b-form v-if="isLoaded">
            <div v-if="$user.person">
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
                label="Номер книжки"
                :fieldValue="person.bookNumber"
                field="bookNumber"
                updateUrl="/site/profile-person" />
              <UpdatableField
                label="Класс"
                :fieldValue="person.danceClass"
                field="danceClass"
                updateUrl="/site/profile-person" />
              <UpdatableField
                type="date"
                label="Дата присвоения"
                :fieldValue="person.danceClassApproveDate"
                field="danceClassApproveDate"
                updateUrl="/site/profile-person" />
              <UpdatableField
                label="Разряд"
                :fieldValue="person.rank"
                field="rank"
                updateUrl="/site/profile-person" />
              <UpdatableField
                label="Разряд Мин.Спорта"
                :fieldValue="person.rankMinsport"
                field="rankMinsport"
                updateUrl="/site/profile-person" />
              <UpdatableField
                type="date"
                label="Действие разряда"
                :fieldValue="person.rankEnds"
                field="rankEnds"
                updateUrl="/site/profile-person" />
              <UpdatableField
                label="Разрядная книжка"
                type="checkbox"
                :fieldValue="person.rankBookExists"
                field="rankBookExists"
                updateUrl="/site/profile-person" />
              <UpdatableField
                label="Телефон"
                :fieldValue="person.phone"
                field="phone"
                updateUrl="/site/profile-person" />
              <UpdatableField
                label="Адрес"
                :fieldValue="person.address"
                field="address"
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
      this.person = await this.$getAsync('/persons/'+this.$user.person);
      this.isLoaded = true;
    }
  },
  data() {
    return {
      password: null,
      person: null,
      isLoaded: false
    };
  }
};
</script>