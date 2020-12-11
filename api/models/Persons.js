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
    content: {
      type: 'string',
      columnType: 'LONGTEXT CHARACTER SET utf8mb4',
      allowNull: true
    }
  },
  beforeDestroy: async function(value, next){
    try {
      if (value.where && value.where.id && value.where.id.in){
        const groupsOfInstructors = await Groups.find({defaultInstructor: value.where.id.in});
        if (groupsOfInstructors.length){
          return next(`Сначала необходимо поменять тренера в группах (${groupsOfInstructors.map(x => x.name)})`);
        }
        const eventsOfInstructors = await Events.find({instructor: value.where.id.in});
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
      await ArchivePersons.destroy({person: value.id}).fetch();
      await Payments.destroy({person: value.id}).fetch();
      await Incomes.destroy({person: value.id}).fetch();
      await Orders.destroy({person: value.id}).fetch();
      await PersonCustomValues.destroy({person: value.id}).fetch();
      await SalaryRules.destroy({instructor: value.id}).fetch();
      await Users.destroy({person: value.id, role: Role.User}).fetch();
      await Payments.destroy({person: value.id}).fetch();
      await PersonCustomValues.destroy({person: value.id}).fetch();
      await Users.update({person: value.id}, {person: null});
      next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};

