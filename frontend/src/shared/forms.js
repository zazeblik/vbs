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
      min: 0,
      required: true
    }
  },
  {
    label: "Месяц",
    property: "month",
    type: "month",
    hidden: true,
    validations: {}
  },
  {
    label: "Год",
    property: "year",
    type: "year",
    hidden: true,
    validations: {}
  },
  {
    label: "Описание",
    property: "description",
    type: "string",
    validations: {}
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
    label: "Стоимость",
    property: "cost",
    type: "number",
    validations: {
      min: 0,
      required: true
    }
  },
  {
    label: "Разовое занятие",
    property: "onceCost",
    type: "number",
    validations: {
      min: 0,
      required: true
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
    label: "Длительность",
    property: "defaultDuration",
    type: "number",
    description: "В минутах",
    validations: {
      min: 0,
      required: true
    }
  },
  {
    property: "type",
    type: "number",
    hidden: true,
    validations: {}
  },
  {
    label: "Расписание",
    property: "schedule",
    type: "schedule",
    validations: {}
  }
];

module.exports.EventForm = [
  {
    property: "group",
    type: "model",
    hidden: true
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
    }
  },
  {
    label: "Длительность",
    property: "duration",
    type: "number",
    validations: {
      min: 0,
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
    validations: {}
  },
  {
    label: "Номер книжки",
    property: "bookNumber",
    type: "string",
    validations: {}
  },
  {
    label: "Класс",
    property: "danceClass",
    type: "string",
    validations: {}
  },
  {
    label: "Дата присвоения",
    property: "danceClassApproveDate",
    type: "date",
    validations: {}
  },
  {
    label: "Разряд",
    property: "rank",
    type: "string",
    validations: {}
  },
  {
    label: "Разряд Мин.Спорта",
    property: "rankMinsport",
    type: "string",
    validations: {}
  },
  {
    label: "Действие разряда",
    property: "rankEnds",
    type: "date",
    validations: {}
  },
  {
    label: "Разрядная книжка",
    property: "rankBookExists",
    type: "checkbox",
    validations: {}
  },
  {
    label: "Телефон",
    property: "phone",
    type: "string",
    validations: {}
  },
  {
    label: "Адрес",
    property: "address",
    type: "string",
    validations: {}
  }
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
  }
]