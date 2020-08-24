module.exports = {
  attributes: {
    name: {
      type: 'string',
      isNotEmptyString: true,
      required: true
    },
    color: {
      type: 'string',
      isNotEmptyString: true,
      isHexColor: true,
      required: true
    },
    content: {
      type: 'string',
      columnType: 'LONGTEXT CHARACTER SET utf8mb4',
      allowNull: true
    },
    groups: {
      collection: 'groups',
      via: 'defaultPlace'
    },
    events: {
      collection: 'events',
      via: 'place'
    }
  },
};

