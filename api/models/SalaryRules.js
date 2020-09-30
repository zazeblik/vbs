const SalaryRuleType = require('../../enums').SalaryRuleType

module.exports = {
  attributes: {
    updater: {
      model: 'users'
    },
    instructor: {
      model: 'persons'
    },
    group: {
      model: 'groups'
    },
    value: {
      type: 'number',
      min: 0,
      required: true
    },
    type: {
      type: 'number',
      defaultsTo: SalaryRuleType.Precentage,
      isIn: [SalaryRuleType.Precentage, SalaryRuleType.FixPerEvent, SalaryRuleType.FixMonthly]
    },
    forPersonalGroups: {
      type: 'boolean',
      defaultsTo: false
    }
  }
};