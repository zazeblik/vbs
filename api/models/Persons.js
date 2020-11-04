const PersonCustomValues = require("./PersonCustomValues");

module.exports = {
  attributes: {
    updater: {
      model: 'users'
    },
    name: {
      type: 'string',
      required: true
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
    content: {
      type: 'string',
      columnType: 'LONGTEXT CHARACTER SET utf8mb4',
      allowNull: true
    }
  },
  afterDestroy: async function(value, next){
    try {
      await ArchivePersons.destroy({person: value.id})
      await Payments.destroy({person: value.id})
      await Incomes.destroy({person: value.id})
      await PersonCustomValues.destroy({person: value.id})
      next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};

