<template>
  <div class="navbar-dark">
    <b-navbar-nav class="px-0" vertical>
      <b-nav-item-dropdown class="border-top border-secondary px-2">
        <template slot="button-content">
          <b-icon icon="collection"></b-icon>&nbsp;База данных
        </template>
        <b-dropdown-item to="/cp/persons">Участники</b-dropdown-item>
        <b-dropdown-item to="/cp/instructors" v-if="$user.role == 2">Тренеры</b-dropdown-item>
        <b-dropdown-item to="/cp/groups" v-if="$user.role == 2">Группы</b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item-dropdown class="border-top border-secondary px-2">
        <template slot="button-content">
          <b-icon icon="journals"></b-icon>&nbsp;Журналы
        </template>
        <b-dropdown-item to="/cp/generals">Общие</b-dropdown-item>
        <b-dropdown-item to="/cp/personals">Индивидуальные</b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item-dropdown class="border-top border-secondary px-2" v-if="$user.role == 2">
        <template slot="button-content">
          <b-icon icon="credit-card"></b-icon>&nbsp;Оплата
        </template>
        <b-dropdown-item to="/cp/payments">Баланс участника</b-dropdown-item>
        <b-dropdown-item to="/cp/incomes">Журнал поступлений</b-dropdown-item>
        <b-dropdown-item to="/cp/debtors">Список должников</b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item-dropdown class="border-top border-secondary px-2" v-if="$user.role == 2">
        <template slot="button-content">
          <b-icon icon="wallet2"></b-icon>&nbsp;Зарплаты
        </template>
        <b-dropdown-item to="/cp/rules">Правила расчёта</b-dropdown-item>
        <b-dropdown-item to="/cp/calculation">Расчёт зарплат</b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item-dropdown class="border-top border-secondary px-2" v-if="$user.role == 2">
        <template slot="button-content">
          <b-icon icon="file-earmark-check"></b-icon>&nbsp;Отчёты
        </template>
        <b-dropdown-item to="/cp/visits-report">По посещениям</b-dropdown-item>
        <b-dropdown-item to="/cp/instructors-report">По тренерам</b-dropdown-item>
        <b-dropdown-item to="/cp/transactions-report">По оплатам</b-dropdown-item>
        <b-dropdown-item to="/cp/activity-report">По активности</b-dropdown-item>
        <b-dropdown-item to="/cp/totals-report">Общая сводка</b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item class="border-top border-secondary px-2" to="/cp/users" v-if="$user.role == 2">
        <b-icon icon="person-square"></b-icon>&nbsp;Учётные записи
      </b-nav-item>
    </b-navbar-nav>
  </div>
</template>