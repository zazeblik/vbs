const Enums = require("../../../enums");
const GroupType = Enums.GroupType;
const IncomeType = Enums.IncomeType;
const Role = Enums.Role;
const SalaryRuleType = Enums.SalaryRuleType;

module.exports.IncomeForm = [
  {
    property: "person",
    type: "model",
    hidden: true
  },
  {
    label: "Сумма",
    property: "sum",
    type: "number",
    validations: {
      min_value: 0,
      required: true
    }
  },
  {
    label: "Тип начисления",
    property: "type",
    type: "enum",
    options: [
      { text: "безналичный", value: IncomeType.Electronic },
      { text: "наличный", value: IncomeType.Cash },
      { text: "другой", value: IncomeType.Other },
    ]
  },
  {
    label: "Примечание",
    property: "description",
    type: "string",
  }
];

module.exports.PaymentForm = [
  {
    property: "person",
    type: "model",
    hidden: true
  },
  {
    property: "group",
    type: "model",
    hidden: true
  },
  {
    label: "Сумма",
    property: "sum",
    type: "number",
    validations: {
      min_value: 0,
      required: true
    }
  },
  {
    label: "Месяц",
    property: "month",
    type: "month",
    hidden: true,
  },
  {
    label: "Год",
    property: "year",
    type: "year",
    hidden: true,
  },
  {
    label: "Описание",
    property: "description",
    type: "string",
  },
  {
    property: "events",
    type: "collection",
    hidden: true
  }
];

module.exports.GroupForm = [
  {
    label: "Наименование",
    property: "name",
    type: "string",
    validations: {
      required: true
    }
  },
  {
    label: "Тип",
    property: "type",
    type: "enum",
    options: [
      { text: "общая", value: GroupType.General },
      { text: "индивидуальная", value: GroupType.Personal }
    ],
    hidden: true,
  },
  {
    label: "Стоимость (руб)",
    property: "cost",
    type: "number",
    visibility: (form) => {
      const typeField = form.find(f => f.property == "type");
      if ( typeField && typeField.value == GroupType.Personal ) {
        return false;
      }
      return true;
    },
    validations: {
      min_value: 0
    }
  },
  {
    label: "Разовый платёж (руб)",
    property: "onceCost",
    type: "number",
    visibility: (form) => {
      const typeField = form.find(f => f.property == "type");
      if ( typeField && typeField.value == GroupType.Personal ) {
        return false;
      }
      return true;
    },
    validations: {
      min_value: 0
    }
  },
  {
    label: "Тренер",
    property: "defaultInstructor",
    type: "model",
    models: []
  },
  {
    label: "Длительность (мин)",
    property: "defaultDuration",
    type: "number",
    description: "В минутах",
    validations: {
      min_value: 0,
      required: true
    }
  },
  {
    label: "Расписание",
    property: "schedule",
    models: [],
    visibility: (form) => {
      const typeField = form.find(f => f.property == "defaultInstructor");
      if ( typeField && !typeField.value ) {
        return false;
      }
      return true;
    },
    type: "schedule",
  },
  {
    label: "Скрыть",
    property: "hidden",
    type: "checkbox",
    hidden: true,
  },
];

module.exports.RuleForm = [
  {
    label: "Тренер",
    property: "instructor",
    type: "model",
    models: [],
  },
  {
    label: "Группа",
    property: "group",
    type: "model",
    models: [],
  },
  {
    label: "Тип",
    property: "type",
    type: "enum",
    options: [
      { text: "процент за занятие", value: SalaryRuleType.Precentage },
      { text: "фиксированная сумма за занятие", value: SalaryRuleType.FixPerEvent },
      { text: "фиксированная сумма за месяц занятий", value: SalaryRuleType.FixMonthly }
    ],
  },
  {
    label: "Значение",
    property: "value",
    type: "number",
    rules: (form) => {
      let rules = {
        min_value: 1,
        required: true
      };
      const typeField = form.find(f => f.property == "type");
      if ( typeField &&  typeField.value == SalaryRuleType.Precentage ) {
        rules.max_value = 100;
      }
      return rules;
    }
  },
  {
    label: "Для типа групп",
    property: "forGroupType",
    type: "enum",
    options: [
      { text: "общая", value: GroupType.General },
      { text: "индивидуальная", value: GroupType.Personal }
    ],
    visibility: (form) => {
      const groupField = form.find(f => f.property == "group");
      if ( groupField &&  groupField.value ) {
        return false;
      }
      return true;
    },
  },
]

module.exports.EventForm = [
  {
    label: "Группа",
    property: "group",
    type: "model",
    models: [],
    hidden: true,
    validations: {
      required: true
    }
  },
  {
    label: "Тренер",
    property: "instructor",
    type: "model",
    models: [],
    validations: {
      required: true
    }
  },
  {
    label: "Время начала",
    property: "startsAt",
    type: "datetime",
    validations: {
      required: true
    },
    value: null,
    time: null
  },
  {
    label: "Длительность",
    property: "duration",
    type: "number",
    validations: {
      min_value: 0,
      required: true
    }
  }
];

module.exports.PersonForm = [
  {
    label: "Фамилия Имя",
    property: "name",
    type: "string",
    validations: {
      required: true
    }
  },
  {
    label: "Дата рождения",
    property: "birthday",
    type: "date",
    validations: {
      regex: /^([0-2][0-9]|(3)[0-1])(\.)(((0)[0-9])|((1)[0-2]))(\.)\d{4}$/i
    },
    value: null
  },
]

module.exports.InstructorForm = [
  {
    label: "Фамилия Имя",
    property: "name",
    type: "string",
    validations: {
      required: true
    }
  },
  {
    label: "Стоимость занятия (руб) для каждого участника, если на занятии было участников",
    property: "prices",
    type: "countPrices"
  },
  {
    label: "Цвет",
    property: "color",
    type: "color",
    validations: {
      required: true
    }
  },
]

module.exports.UserForm = [
  {
    label: "Логин",
    property: "login",
    type: "string",
    validations: {
      required: true
    }
  },
  {
    label: "Пароль",
    property: "password",
    type: "password",
    validations: {
      min: 8,
      regex: /^([A-Za-z0-9_]+)$/
    }
  },
  {
    label: "Роль",
    property: "role",
    type: "enum",
    options: [
      { text: "тренер", value: Role.Coach },
      { text: "админ", value: Role.LocalAdmin }

    ]
  },
  {
    label: "Тренер",
    property: "instructor",
    type: "model",
    models: []
  },
]