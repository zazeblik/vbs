<template>
  <div class="py-2">
    <h5>Настройки</h5>
    <validation-observer ref="observer">
    <b-tabs fill small class="pt-2">
      <b-tab title="Персональные">
        <b-form class="pt-2">
          <UpdatableField 
            label="Открывать форму платежей после пополнения счёта"
            type="checkbox"
            :fieldValue="$user.autoOpenPaymentModel"
            field="autoOpenPaymentModel"
            :settingsField="true"
            :updateUrl="`/users/edit/${$user.id}`" />
        </b-form> 
      </b-tab>
      <b-tab title="Общие">
        <b-form class="pt-2">
          <UpdatableField 
            label="Спивывать оплаты за индивидуальные занятия автоматически с баланса участников каждый день в 00:00 при наличии необходимой для оплаты суммы"
            type="checkbox"
            :fieldValue="$settings.autoDebitPersonalEvents"
            field="autoDebitPersonalEvents"
            :settingsField="true"
            updateUrl="/settings/update" />
        </b-form>
        <b-form class="pt-2">
          <UpdatableField 
            label="Возвращать суммы оплат на баланс участников автоматически при удалении индивидуального занятия"
            type="checkbox"
            :fieldValue="$settings.autoRefundOnDeletePersonalEvents"
            field="autoRefundOnDeletePersonalEvents"
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