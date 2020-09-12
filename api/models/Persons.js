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
    bookNumber: {
      type: 'string',
      allowNull: true
    },
    danceClass: {
      type: 'string',
      allowNull: true
    },
    danceClassApproveDate: {
      type: 'number',
      allowNull: true
    },
    rank: {
      type: 'string',
      allowNull: true
    },
    rankMinsport: {
      type: 'string',
      allowNull: true
    },
    rankEnds: {
      type: 'number',
      allowNull: true
    },
    rankBookExists: {
      type: 'boolean',
      defaultsTo: false
    },
    phone: {
      type: 'string',
      allowNull: true
    },
    address: {
      type: 'string',
      allowNull: true
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
      await ArchivePersons.destroy({person: value.id}).fetch();
      await Payments.destroy({person: value.id}).fetch();  
      await Incomes.destroy({person: value.id}).fetch();  
      next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};

