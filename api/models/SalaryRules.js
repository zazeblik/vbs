const SalaryRuleType = require('../../enums').SalaryRuleType
const GroupType = require('../../enums').GroupType

module.exports = {
  attributes: {
    updater: {
      model: 'users'
    },
    instructor: {
      model: 'instructors'
    },
    group: {
      model: 'groups'
    },
    value: {
      type: 'number',
      min: 1,
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
    provider: {
      model: 'providers'
    }
  },
  beforeCreate: async function (value, next) {
    try {
      const existsRulesCount = await SalaryRules.count({
        instructor: value.instructor, 
        group: value.group, 
        forGroupType: value.forGroupType,
        forGroupType: value.forGroupType,
        provider: value.provider
      });
      if (existsRulesCount) {
        return next(`Такое правило уже есть`);
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  beforeUpdate: async function (valueToSet, next) {
    try {
      const id = valueToSet.id;
      const actualRule = await SalaryRules.findOne({id: id, provider: valueToSet.provider});
      const existsRulesCount = await SalaryRules.count({
        id: {"!=": id},
        instructor: valueToSet.instructor || actualRule.instructor, 
        group: valueToSet.group || actualRule.group, 
        forGroupType: valueToSet.forGroupType || actualRule.forGroupType,
        provider: valueToSet.provider
      });
      if (existsRulesCount) {
        return next(`Такое правило уже есть`);
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  beforeDestroy: async function(value, next){
    try {
      if (value.where && value.where.and && value.where.and.length){
        const params = value.where.and;
        const ids = params.find(x => x.id)?.id?.in;
        const provider = params.find(x => x.provider)?.provider;
        if (ids && ids.length && provider) {
          const actualRules = await SalaryRules.find({id: ids, provider: provider});
          let abortDestroy = false;
          actualRules.forEach(actualRule => {
            if (!actualRule.group && !actualRule.instructor) {
              abortDestroy = true;
            }
          });
          if (abortDestroy){
            return next(`Запрещено удалять общие правила`);
          }
        }
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};