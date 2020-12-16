<template>
  <b-container class="py-2">
    <PaymentsBlock :isControlPanelShown="false" />
  </b-container>
</template>

<script>
import PaymentsBlock from "../../components/PaymentsBlock";
export default {
  components: {
    PaymentsBlock
  }
}
</script>