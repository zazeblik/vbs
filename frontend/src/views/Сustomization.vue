<template>
  <div class="py-2">
    <h5>Общие настройки</h5>
    <validation-observer ref="observer">
    <b-tabs fill small class="pt-2">
      <b-tab title="Индивидуальные занятия">
        <b-form class="pt-2">
          <UpdatableField 
            label="Действие при посещении с достаточным балансом"
            :validations="{ required: true }"
            type="select"
            :options="options"
            :fieldValue="$settings.debitMode"
            field="debitMode"
            :settingsField="true"
            updateUrl="/site/update" />
          <UpdatableField
            label="Делить сумму на всех присутствовавших"
            type="checkbox"
            :fieldValue="$settings.divideSumMode"
            field="divideSumMode"
            :settingsField="true"
            updateUrl="/site/update" />
        </b-form> 
      </b-tab>
    </b-tabs>
    </validation-observer>
  </div>
</template>

<script>
const PersonalDebitMode = require("../../../enums").PersonalDebitMode;
import UpdatableField from "../components/UpdatableField";
export default {
  components: {
    UpdatableField
  },
  data() {
    return {
      options: [
        {value: PersonalDebitMode.AlwaysAsk, text: 'Всегда спрашивать'},
        {value: PersonalDebitMode.AlwaysDebit, text: 'Всегда списывать'},
        {value: PersonalDebitMode.AlwaysNoDebit, text: 'Никогда не списывать'}
      ]
    }
  }
};
</script>