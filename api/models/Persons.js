const Role = require('../../enums').Role;

module.exports = {
  attributes: {
    updater: {
      model: 'users'
    },
    name: {
      type: 'string',
      required: true,
      unique: true
    },
    birthday: {
      type: 'number',
      allowNull: true
    },
    groups: {
      collection: 'groups',
      via: 'members'
    },
    events: {
      collection: 'events',
      via: 'visitors'
    },
    payments: {
      collection: 'payments',
      via: 'person'
    },
    incomes: {
      collection: 'incomes',
      via: 'person'
    },
    balance: {
      type: 'number',
      defaultsTo: 0
    },
    provider: {
      model: 'providers'
    }
  },
  beforeDestroy: async function(value, next){
    try {
      if (value.where && value.where.id && value.where.id.in){
        const groupsOfInstructors = await Groups.find({defaultInstructor: value.where.id.in, provider: value.provider});
        if (groupsOfInstructors.length){
          return next(`Сначала необходимо поменять тренера в группах (${groupsOfInstructors.map(x => x.name)})`);
        }
        const eventsOfInstructors = await Events.find({instructor: value.where.id.in, provider: value.provider});
        if (eventsOfInstructors.length){
          return next(`Сначала необходимо удалить занятия, где учасник является тренером`);
        }
      }
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  },
  afterDestroy: async function(value, next){
    try {
      await GroupMemberActions.destroy({person: value.id, provider: value.provider});
      await Payments.destroy({person: value.id, provider: value.provider});
      await Incomes.destroy({person: value.id, provider: value.provider});
      await Orders.destroy({person: value.id, provider: value.provider});
      await PersonCustomValues.destroy({person: value.id, provider: value.provider});
      await SalaryRules.destroy({instructor: value.id, provider: value.provider});
      await Payments.destroy({person: value.id, provider: value.provider});
      next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};

