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
      model: 'persons'
    },
    defaultPlace: { 
      model: 'places'
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
      required: true
    },
    onceCost: {
      type: 'number',
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
  },
  afterDestroy: async function(value, next){
    try {
      await ArchivePersons.destroy({group: value.id}).fetch();
      await Events.destroy({group: value.id}).fetch();  
      next();
    } catch (error) {
      return next(JSON.stringify([ error ]));
    }
  }
};

