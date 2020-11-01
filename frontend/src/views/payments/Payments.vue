<template>
  <div class="py-2">
    <h5>История</h5>
    <PaymentsBlock :isControlPanelShown="true" />
  </div>
</template>

<script>
import PaymentsBlock from "../../components/PaymentsBlock";
export default {
  components: {
    PaymentsBlock
  }
}; 
</script>
