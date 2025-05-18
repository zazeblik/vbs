<template>
  <b-form-group>
    <validation-provider
      :rules="{ required: true, min: 0}"
      v-slot="validationContext"
    >
      <b-input-group v-for="countPrice in countPrices" :key="countPrice.count" size="sm" :prepend="`${countPrice.count}:`">
        <b-form-input
          type="number"
          size="sm"
          placeholder="Введите сумму"
          v-model="countPrice.price"
          :state="getValidationState(validationContext)"
        />
      </b-input-group>
    </validation-provider>
    <b-button-group size="sm">
      <b-button :disabled="countPrices.length == 1" variant="outline-danger" @click="removeCountPrice()">
        <b-icon icon="slash-circle-fill" rotate="45" />&nbsp;<span class="d-none d-md-inline-block">Удалить</span>
      </b-button>
      <b-button variant="outline-success" @click="addCountPrice()">
        <b-icon icon="plus-circle-fill" />&nbsp;<span class="d-none d-md-inline-block">Добавить</span>
      </b-button>
    </b-button-group>
  </b-form-group>
</template>

<script>
export default {
  props: [ "value" ],
  data() {
    return {
      countPrices: []
    };
  },
  async mounted() {
    this.countPrices = this.value;
  },
  methods: {
    getValidationState({ dirty, validated, valid = null }) {
      return dirty || validated ? valid : null;
    },
    addCountPrice() {
      this.countPrices.push({count: this.countPrices.length + 1, price: 1000});
    },
    removeCountPrice() {
      this.countPrices.pop();
    },
    getValue() {
      return this.countPrices;
    }
  }
};
</script>

<style scoped>

</style>