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
      min: 0,
      required: true
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
};

