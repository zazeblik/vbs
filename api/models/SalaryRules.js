const SalaryRuleType = require('../../enums').SalaryRuleType
const GroupType = require('../../enums').GroupType

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
    forGroupType: {
      type: 'number',
      isIn: [GroupType.General, GroupType.Personal],
      defaultsTo: GroupType.General
    },
  }
};