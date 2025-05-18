const GroupType = require('../../enums').GroupType

module.exports = {
  attributes: {
    updater: {
      model: 'users'
    },
    name: {
      type: 'string',
      isNotEmptyString: true,
      required: true
    },
    defaultInstructor: {
      model: 'instructors'
    },
    defaultDuration: {
      type: 'number',
      min: 0,
      required: true
    },
    type: {
      type: 'number',
      isIn: [GroupType.General, GroupType.Personal],
      defaultsTo: GroupType.General
    },
    cost: {
      type: 'number',
      min: 0,
      allowNull: true
    },
    onceCost: {
      type: 'number',
      min: 0,
      allowNull: true
    },
    schedule: {
      type: 'string',
      allowNull: true
    },
    members: {
      collection: 'persons',
      via: 'groups'
    },
    hidden: {
      type: 'boolean',
      defaultsTo: false
    },
    provider: {
      model: 'providers'
    }
  },
  afterDestroy: async function(value, next){
    try {
      await GroupMemberActions.destroy({group: value.id, provider: value.provider});
      await SalaryRules.destroy({group: value.id, provider: value.provider});
      await Payments.destroy({group: value.id, provider: value.provider});
      await Events.destroy({group: value.id, provider: value.providers});  
      return next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};

