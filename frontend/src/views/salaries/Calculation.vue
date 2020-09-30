<template>
  <div>
    <b-table
      show-empty
      small
      responsive="sm"
      :items="items"
      class="my-2 data-table"
      :busy="isBusy"
      empty-text="Записей не найдено"
      empty-filtered-text="Записей не найдено"
    >
      <template v-slot:cell(types)="row">
        <b-table
          small
          responsive="sm"
          :items="row.item.types"
          thead-class="d-none"
        >
        </b-table>
      </template>
      <template v-slot:table-busy>
        <div class="text-center text-secondary my-2">
          <b-spinner small class="align-middle"></b-spinner>
          <strong>Загрузка...</strong>
        </div>
      </template>
    </b-table>
  </div>
</template>

<script>
export default {
  data() {
    return {
      isBusy: false,
      items: [{
        instructor: "Николаев Роман",
        types: [
          {
            name: "Общие",
            groups: [
              {
                name: "Дети 4 года",
                eventsCount: 7,
                ruleDescription: "100 рублей за занятие",
                sum: 700
              },
              {
                name: "Дети 5 лет",
                eventsCount: 6,
                ruleDescription: "50% за месяц",
                sum: 750
              }
            ],
            totalSum: 1450
          },
          {
            name: "Индивидуальные",
            groups: [
              {
                name: "Егошин - Карманова",
                eventsCount: 4,
                ruleDescription: "50% за занятие",
                sum: 1000
              },
              {
                name: "Таланов - Таланова",
                eventsCount: 3,
                ruleDescription: "40% за занятие",
                sum: 1200
              }
            ],
            totalSum: 2200
          }
        ],
        totalSum: 3650
      }]
    };
  },
}
</script>