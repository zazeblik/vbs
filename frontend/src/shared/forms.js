const SalaryRules = require("../../../api/models/SalaryRules");
const Enums = require("../../../enums");
const GroupType = Enums.GroupType;
const SiteBlock = Enums.SiteBlock;
const FilesBlock = Enums.FilesBlock;
const Role = Enums.Role;
const SalaryRuleType = Enums.SalaryRuleType;

module.exports.ArchivePersonForm = [
  {
    label: "Участник",
    property: "person",
    type: "model",
    validations: {
      required: true
    }
  },
  {
    label: "Группа",
    property: "group",
    type: "model",
    validations: {
      required: true
    }
  }
];

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
    label: "Описание",
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
    validations: {
      min_value: 0,
      required: true
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
    models: [],
    validations: {
      required: true
    }
  },
  {
    label: "Зал",
    property: "defaultPlace",
    type: "model",
    models: [],
    validations: {
      required: true
    }
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
    type: "schedule",
  },
  {
    label: "Скрыть",
    property: "hidden",
    type: "checkbox",
    hidden: true,
  },
  {
    label: "Описание",
    property: "content",
    type: "content"
  },
];

module.exports.MaterialForm = [
  {
    label: "Наименование",
    property: "name",
    type: "string",
    validations: {
      required: true
    }
  },
  {
    label: "Изображение",
    property: "image",
    accept: "image/*",
    type: "file",
  },
  {
    label: "Контент",
    property: "content",
    type: "content"
  },
  {
    label: "Опубликовано",
    property: "public",
    type: "checkbox",
    defaultValue: true,
  },
  {
    label: "На главной",
    property: "onMain",
    type: "checkbox", 
  },
  {
    label: "Блок",
    property: "block",
    type: "enum",
    options: [
      { text: "не задано", value: SiteBlock.Unset },
      { text: "статьи", value: SiteBlock.Articles },
      { text: "о клубе", value: SiteBlock.Club },
      { text: "направления", value: SiteBlock.Сourse },
      { text: "руководители", value: SiteBlock.Boss },
      { text: "отзывы", value: SiteBlock.Feedback },
      { text: "контакты", value: SiteBlock.Contacts },
    ],
  },
  {
    label: "Приоритет",
    property: "priority",
    type: "number",
    description: "Чем больше число, тем вше будет расположен материал",
    defaultValue: 1,
    validations: {
      min_value: 1
    }
  }
]

module.exports.FileForm = [
  {
    label: "Наименование",
    property: "name",
    type: "string",
    validations: {
      required: true
    }
  },
  {
    label: "Файл",
    property: "file",
    accept: "*",
    type: "file",
  },
  {
    label: "Блок",
    property: "block",
    type: "enum",
    options: [
      { text: "турниры", value: FilesBlock.Tournaments },
      { text: "фото", value: FilesBlock.Photo },
      { text: "слайдер", value: FilesBlock.Slider }
    ],
  },
]

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
      { text: "фиксированная сумма за занятие с человека", value: SalaryRuleType.FixPerEvent },
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
    label: "Зал",
    property: "place",
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
  {
    label: "Номер книжки",
    property: "bookNumber",
    type: "string",
  },
  {
    label: "Класс",
    property: "danceClass",
    type: "string",
  },
  {
    label: "Дата присвоения",
    property: "danceClassApproveDate",
    type: "date",
    validations: {
      regex: /^([0-2][0-9]|(3)[0-1])(\.)(((0)[0-9])|((1)[0-2]))(\.)\d{4}$/i
    },
    value: null
  },
  {
    label: "Разряд",
    property: "rank",
    type: "string",
  },
  {
    label: "Разряд Мин.Спорта",
    property: "rankMinsport",
    type: "string",
  },
  {
    label: "Действие разряда",
    property: "rankEnds",
    type: "date",
    validations: {
      regex: /^([0-2][0-9]|(3)[0-1])(\.)(((0)[0-9])|((1)[0-2]))(\.)\d{4}$/i
    },
    value: null
  },
  {
    label: "Разрядная книжка",
    property: "rankBookExists",
    type: "checkbox",
  },
  {
    label: "Телефон",
    property: "phone",
    type: "string",
  },
  {
    label: "Адрес",
    property: "address",
    type: "string",
  },
  {
    label: "Описание",
    property: "content",
    type: "content"
  },
]

module.exports.PlaceForm = [
  {
    label: "Наименование",
    property: "name",
    type: "string",
    validations: {
      required: true
    }
  },
  {
    label: "Цвет",
    property: "color",
    type: "color",
    validations: {
      required: true
    }
  },
  {
    label: "Описание",
    property: "content",
    type: "content"
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
    label: "Участник",
    property: "person",
    type: "model",
    models: []
  },
  {
    label: "Роль",
    property: "role",
    type: "enum",
    options: [
      { text: "участник", value: Role.User },
      { text: "тренер", value: Role.Coach },
      { text: "админ", value: Role.LocalAdmin }

    ]
  },
]