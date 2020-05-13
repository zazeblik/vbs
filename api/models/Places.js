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

