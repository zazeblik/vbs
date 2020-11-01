<template>
  <div class="navbar-dark">
    <b-navbar-nav class="px-0" vertical>
      <b-nav-item-dropdown class="border-top border-secondary px-2">
        <template slot="button-content">
          <b-icon icon="collection"></b-icon>&nbsp;База данных
        </template>
        <b-dropdown-item to="/cp/persons">Участники</b-dropdown-item>
        <b-dropdown-item to="/cp/places" v-if="$user.role == 2">Залы</b-dropdown-item>
        <b-dropdown-item to="/cp/groups">Группы</b-dropdown-item>
        <b-dropdown-item to="/cp/archive">Архив</b-dropdown-item>
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
          <b-icon icon="globe2"></b-icon>&nbsp;Сайт
        </template>
        <b-dropdown-item to="/cp/settings">Настройки</b-dropdown-item>
        <b-dropdown-item to="/cp/materials">Материалы</b-dropdown-item>
        <b-dropdown-item to="/cp/files">Файлы</b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item class="border-top border-secondary px-2" to="/cp/payments" v-if="$user.role == 2">
        <b-icon icon="credit-card"></b-icon>&nbsp;Оплата
      </b-nav-item>
      <b-nav-item-dropdown class="border-top border-secondary px-2">
        <template slot="button-content">
          <b-icon icon="wallet2"></b-icon>&nbsp;Зарплаты
        </template>
        <b-dropdown-item to="/cp/rules">Правила расчёта</b-dropdown-item>
        <b-dropdown-item to="/cp/calculation">Расчёт зарплат</b-dropdown-item>
      </b-nav-item-dropdown>
      <b-nav-item class="border-top border-secondary px-2" to="/cp/users" v-if="$user.role == 2">
        <b-icon icon="person-square"></b-icon>&nbsp;Учётные записи
      </b-nav-item>
    </b-navbar-nav>
  </div>
</template>