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

