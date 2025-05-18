<template>
  <div class="py-2">
    <h5>Общие настройки</h5>
    <validation-observer ref="observer">
    <b-tabs fill small class="pt-2">
      <b-tab title="Платежи">
        <b-form class="pt-2">
          <UpdatableField 
            label="Открывать форму платежей после пополнения счёта"
            type="checkbox"
            :fieldValue="$settings.autoOpenPaymentModel"
            field="autoOpenPaymentModel"
            :settingsField="true"
            updateUrl="/settings/update" />
        </b-form> 
      </b-tab>
      <b-tab title="Индивидуальные занятия">
        <b-form class="pt-2">
          <UpdatableField 
            label="Спивывать оплаты за занятия автоматически с баланса участника"
            type="checkbox"
            :fieldValue="$settings.autoDebitPersonalEvents"
            field="autoDebitPersonalEvents"
            :settingsField="true"
            updateUrl="/settings/update" />
        </b-form> 
      </b-tab>
    </b-tabs>
    </validation-observer>
  </div>
</template>

<script>
import UpdatableField from "../components/UpdatableField";
export default {
  components: {
    UpdatableField
  },
  data() {
    return {}
  }
};
</script>